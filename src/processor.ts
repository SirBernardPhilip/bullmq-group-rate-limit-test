import { ProcessorPro, WorkerPro } from "@taskforcesh/bullmq-pro";
import { container } from "tsyringe";
import {
  SubtaskPayloadInterface,
  BackgroundJobs,
  QueueBroker,
} from "./queue-broker";
import { RateLimiter } from "./rate-limiter";

export const processor: ProcessorPro<
  SubtaskPayloadInterface,
  void,
  BackgroundJobs
> = async (job) => {
  const jobPayload = job.data;
  console.log(`Running job with data: `, jobPayload);
  // Wait for 2 seconds to make it a bit slower
  await new Promise((resolve) => setTimeout(resolve, 2000));
  // If its subtask 2, rate limit it the first time it runs
  if (
    jobPayload.subtaskId === "subtask2" &&
    container.resolve(RateLimiter).shouldRateLimit()
  ) {
    console.log("Rate limiting job with data: ", jobPayload);
    container
      .resolve(QueueBroker)
      .workers["IMPORT_EVERNOTE"].rateLimitGroup(job, 5000);
    throw WorkerPro.RateLimitError();
  }

  console.log("Finished job with data: ", jobPayload);
};
