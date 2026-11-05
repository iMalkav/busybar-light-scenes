import {
  record,
  str,
  cycle,
  splitList,
  source,
  App,
  type Settings,
  type View,
  type HttpSpec,
} from "./lib.ts";

export class AppModel extends App {
  scenes: { name: string; id: string }[] = [];
  selected = 0;
  armed = false;
  message = "Select a scene";
  constructor(s: Settings, saved: Settings, now: number) {
    super(s, saved, now);
    for (const entry of splitList(str(s, "scenes"), 12)) {
      const i = entry.indexOf("=");
      if (i > 0 && /^scene\.[a-z0-9_]+$/.test(entry.slice(i + 1)))
        this.scenes.push({ name: entry.slice(0, i), id: entry.slice(i + 1) });
    }
  }
  request(_now: number): HttpSpec | undefined {
    return undefined;
  }
  key(key: string, delta: number, _now: number): boolean {
    if (key === "wheel") {
      this.selected = cycle(this.selected, delta, this.scenes.length);
      this.armed = false;
    }
    if (key === "back" && this.armed) {
      this.armed = false;
      return true;
    }
    if (key === "ok" && this.scenes.length && !this.commandBusy) {
      if (!this.armed) {
        this.armed = true;
        return false;
      }
      const ha = str(this.settings, "provider") === "home_assistant";
      const v = this.scenes[this.selected];
      try {
        const spec = source(
          this.settings,
          ha ? "/api/services/scene/turn_on" : "/command",
        );
        this.send({
          ...spec,
          method: "POST",
          headers: { ...spec.headers, "Content-Type": "application/json" },
          body: JSON.stringify(ha ? { entity_id: v.id } : { scene: v.id }),
          kind: "scene",
        });
        this.message = "Activating...";
        this.armed = false;
      } catch (error) {
        this.fail(
          error instanceof Error ? error.message : "Set source in Setup",
        );
      }
    }
    return false;
  }
  receive(value: unknown, now: number): void {
    if (
      str(this.settings, "provider") !== "home_assistant" &&
      record(value).result !== "ok"
    )
      throw new Error("Scene was not accepted");
    this.message = "Scene activated";
    this.lastReceived = now;
    this.error = "";
  }
  fail(message: string): void {
    super.fail(message);
    this.message = "Activation failed";
  }
  view(_now: number): View {
    return {
      title: "Light Scenes",
      value: this.scenes.length
        ? this.scenes[this.selected].name
        : "SET SCENES",
      rows: [this.armed ? "Activate this scene?" : this.message, this.error],
      hint: this.commandBusy
        ? "SENDING..."
        : this.armed
          ? "OK activate / Back cancel"
          : "Wheel select / OK confirm",
    };
  }
}
