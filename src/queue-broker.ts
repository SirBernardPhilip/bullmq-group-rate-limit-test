import { QueuePro, WorkerPro, WorkerProOptions } from "@taskforcesh/bullmq-pro";
import { singleton } from "tsyringe";
import { processor } from "./processor";

export interface SubtaskPayloadInterface {
  subtaskId: string; // For internal use in our own databases
  userPrivateId: string; // The group id
}

export enum JobTypeEnum {
  IMPORT_EVERNOTE = "IMPORT_EVERNOTE",
}

export type BackgroundJobs = "IMPORT_EVERNOTE";

const workerSettings: {
  [key in BackgroundJobs]: WorkerProOptions;
} = {
  ["IMPORT_EVERNOTE"]: {},
};

@singleton()
export class QueueBroker {
  private readonly queues: {
    [key in BackgroundJobs]: QueuePro<
      SubtaskPayloadInterface,
      void,
      BackgroundJobs
    >;
  };
  public readonly workers: {
    [key in BackgroundJobs]: WorkerPro<
      SubtaskPayloadInterface,
      void,
      BackgroundJobs
    >;
  };
  constructor() {
    this.queues = {} as {
      [key in BackgroundJobs]: QueuePro<
        SubtaskPayloadInterface,
        void,
        BackgroundJobs
      >;
    };
    this.workers = {} as {
      [key in BackgroundJobs]: WorkerPro<
        SubtaskPayloadInterface,
        void,
        BackgroundJobs
      >;
    };
    const url = new URL("redis://localhost:6379");
    for (const jobType of Object.values(JobTypeEnum)) {
      this.queues[jobType] = new QueuePro<
        SubtaskPayloadInterface,
        void,
        BackgroundJobs
      >(jobType, {
        connection: {
          host: url.hostname,
          port: Number(url.port),
          enableOfflineQueue: false,
        },
        defaultJobOptions: {
          removeOnComplete: true,
          removeOnFail: true,
        },
        isPro: true,
      });
      this.workers[jobType] = new WorkerPro<
        SubtaskPayloadInterface,
        void,
        BackgroundJobs
      >(jobType, processor, {
        connection: {
          host: url.hostname,
          port: Number(url.port),
        },
        concurrency: 10,
        group: {
          concurrency: 1,
        },
        ...workerSettings[jobType],
      });
      this.workers[jobType].on("error", (err: Error) => {
        console.log(err);
      });
    }
  }

  public async addSubtasks<T extends SubtaskPayloadInterface>(
    jobType: BackgroundJobs,
    payloads: T[]
  ): Promise<void> {
    await this.queues[jobType].addBulk(
      payloads.map((payload) => {
        return {
          name: jobType,
          data: payload,
          opts: { group: { id: payload.userPrivateId } },
        };
      })
    );
  }

  public async addSubtask<T extends SubtaskPayloadInterface>(
    jobType: BackgroundJobs,
    payload: T
  ): Promise<void> {
    return await this.addSubtasks(jobType, [payload]);
  }

  public async close(): Promise<void> {
    await Promise.all(
      Object.values(JobTypeEnum).map(async (jobType) => {
        await this.workers[jobType].close();

        await this.queues[jobType].close();
      })
    );
  }

  public getQueues() {
    return this.queues;
  }
}

