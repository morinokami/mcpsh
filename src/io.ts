import { styleText } from "node:util";

export function red(text: string) {
	return console.log(styleText("red", text));
}
export function green(text: string) {
	return console.log(styleText("green", text));
}
export function blue(text: string) {
	return console.log(styleText("blue", text));
}
export function yellow(text: string) {
	return console.log(styleText("yellow", text));
}
