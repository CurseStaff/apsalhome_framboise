import { Component, OnInit } from "@angular/core";

import { PorcupineService } from "@picovoice/porcupine-web-angular";
import { PorcupineWorkerFactory } from "@picovoice/porcupine-web-fr-worker";

declare var webkitSpeechRecognition: any;

type VoiceState = "loading" | "error" | "idle" | "transcribing";

@Component({
  selector: "app-voicebox",
  templateUrl: "./voicebox.component.html",
  styleUrls: ["./voicebox.component.scss"]
})
export class VoiceboxComponent implements OnInit {
  state: VoiceState = "loading";
  transcript: string = "";
  speech: any = null;
  errorMessage: string | null = null;

  constructor(private porcupineService: PorcupineService) {}

  ngOnInit(): Promise<void> {
    try {
      this.porcupineService.init(PorcupineWorkerFactory, {
        keywords: ["Framboise"]
      });
    } catch (error) {}

    var trigger = "on";
    console.log("init");
    var result = "";
    var result_old = "";

    // new SpeechSynthesisUtterance object
    let utter = new SpeechSynthesisUtterance();
    utter.lang = "fr-FR";
    utter.volume = 0.5;

    // Supports Speech API? (i.e., is Chrome)
    if (typeof webkitSpeechRecognition === "undefined") {
      this.state = "error";
      this.errorMessage =
        "This browser does not support the Web Speech API. The wake word will work, but transcription will not. Try it in Chrome to use transcription.";
      return;
    }

    this.speech = new webkitSpeechRecognition();
    this.speech.interimResults = true;
    this.speech.continuous = false;

    this.speech.onresult = (event: any) => {
      //build result
      result = "";
      for (const line of event.results) {
        result += line[0].transcript.trim() + "\n\n";
      }
    };

    this.speech.onend = (event: any) => {
      this.speech.stop();
      if (result !== result_old) {
        result_old = result;
        console.log(result);
      }
      trigger = "on";
      console.log("ready for next listen !");
    };

    this.porcupineService.keyword$.subscribe((keyword) => {
      console.log(keyword);
      switch (keyword) {
        case "Framboise": {
          if (trigger === "on") {
            trigger = "off";

            // listen
            console.log("listen google...");
            this.speech.start();

            utter.text = "oui ?";
            window.speechSynthesis.speak(utter);
          }

          break;
        }
      }
    });
  }
}
