export default function namingWorkerId(workerId: string): string {
	'use strict';
	workerId = workerId.toString().trim();
	switch (workerId) {
		case '1':
			return '向日葵';
		case '2':
			return '櫻子';
		case '3':
			return 'あかり';
		case '4':
			return 'ちなつ';
		case '5':
			return '結衣';
		case '6':
			return '京子';
		case '7':
			return '綾乃';
		case '8':
			return '千歳';
		default:
			return workerId;
	}
}
