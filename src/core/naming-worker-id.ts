export default function(workerId: string): string {
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
		case '9':
			return '千鶴';
		case '10':
			return 'りせ';
		case '11':
			return '西垣';
		case '12':
			return '花子';
		case '13':
			return '撫子';
		case '14':
			return 'あかね';
		case '15':
			return 'ともこ';
		case '16':
			return 'めぐみ';
		case '17':
			return '藍';
		case '18':
			return '美穂';
		case '19':
			return 'こころ';
		case '20':
			return 'みさき';
		default:
			return workerId;
	}
}
