export default function(ua: string): string {
	if (ua !== undefined && ua !== null) {
		ua = ua.toLowerCase();
		if (/(iphone|ipod|ipad|android|windows.*phone|psp|vita|nitro|nintendo)/i.test(ua)) {
			return 'mobile';
		} else {
			return 'desktop';
		}
	} else {
		return 'desktop';
	}
}
