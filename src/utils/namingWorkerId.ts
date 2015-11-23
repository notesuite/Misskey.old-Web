export default function namingWorkerId(workerId: string): string {
	'use strict';
	workerId = workerId.toString().trim();
	switch (workerId) {
		case '1':
			return '向日葵';
			break;
		case '2':
			return '櫻子';
			break;
		case '3':
			return 'あかり';
			break;
		case '4':
			return 'ちなつ';
			break;
		case '5':
			return '結衣';
			break;
		case '6':
			return '京子';
			break;
		case '7':
			return '綾乃';
			break;
		case '8':
			return '千歳';
			break;
		default:
			return workerId;
			break;
	}
}
