import { QueueBroker } from './queue-broker';

void (async (): Promise<void> => {
	try {
		const queueBroker = QueueBroker.getInstance();
		console.log('QueueBroker created, adding 3 subtasks for user1');
		queueBroker.addSubtasks('IMPORT_EVERNOTE', [
			{
				subtaskId: 'subtask1',
				userPrivateId: 'user1',
			},
			{
				subtaskId: 'subtask2',
				userPrivateId: 'user1',
			},
			{
				subtaskId: 'subtask3',
				userPrivateId: 'user1',
			},
		]);
	} catch (e) {
		console.error(e);
		process.exit(1);
	}
})();
