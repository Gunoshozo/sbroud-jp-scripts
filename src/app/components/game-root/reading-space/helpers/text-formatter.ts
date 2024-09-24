import { ReadableLine } from "../models/lines.model"

export class TextFormatter {
    public static preprocessTextString(text: string): ReadableLine[] {
        let result: ReadableLine[] = []
        const lines = text.split("\n");
        let choiceCurve = 0;
        lines.forEach((it) => {
            if (it.includes("--choiceEnd")) {
                choiceCurve--;
            } else if (it.includes("--choice")) {
                choiceCurve++;
            }
        })

        result = this.collectLines(lines, 0)[0]
        return result
    }

    private static collectLines(lines: string[], startIndex: number): [ReadableLine[], number] {
        let result: ReadableLine[] = []
        let i = startIndex
        for (; i < lines.length; i++) {
            if (!lines[i].includes('--choice')) {
                result.push({ text: this.processLine(lines[i]), index: i })
            } else {
                if (lines[i].includes("--choiceLink")) {
                    result.push({ text: lines[i].replace("--choiceLink ", ""), index: i })
                } else if (lines[i].includes("--choiceEnd")) {
                    break;
                } else if (lines[i].includes("--choice")) {
                    let choice: ReadableLine = { text: lines[i].replace("--choice ", ""), isChoice: true, innerLines: [], index: i }
                    const foldedLines = this.collectLines(lines, i + 1)
                    choice.innerLines = foldedLines[0]
                    i = foldedLines[1]
                    result.push(choice)
                }
            }

        }
        return [result, i]
    }

    private static processLine(line: string): string{
        return line.replaceAll("\\n", "\n")
    }
}
