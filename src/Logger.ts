import { Array, Logger } from "effect";
import { Ansi, AnsiDoc } from "@effect/printer-ansi";

const AnsiDocLogger = Logger.make(({ message }) => {
  const messageArr = Array.ensure(message);
  for (let i = 0; i < messageArr.length; i++) {
    const currentMessage = messageArr[i];
    if (AnsiDoc.isDoc(currentMessage)) {
      const prefix = AnsiDoc.text("create-akatov-template").pipe(
        AnsiDoc.annotate(Ansi.cyan),
        AnsiDoc.squareBracketed,
        AnsiDoc.cat(AnsiDoc.colon),
      );
      const document = AnsiDoc.catWithSpace(
        prefix,
        currentMessage as AnsiDoc.AnsiDoc,
      );
      globalThis.console.log(AnsiDoc.render(document, { style: "pretty" }));
    }
  }
});

export default AnsiDocLogger;
