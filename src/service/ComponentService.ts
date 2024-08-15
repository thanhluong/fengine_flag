import Phaser from "phaser";
import short from "short-uuid";

export interface IComponent {
  init(go: Phaser.GameObjects.GameObject): void;
  awake?: () => void;
  start?: () => void;
  update?: (dt: number) => void;
  destroy?: () => void;
}

export default class ComponentService {
  private compByGameObject = new Map<string, IComponent[]>();
  private startQueue: IComponent[] = [];
  addComponent(go: Phaser.GameObjects.GameObject, component: IComponent) {
    if (!go.name) {
      go.name = short.generate();
    }

    if (!this.compByGameObject.get(go.name)) {
      this.compByGameObject.set(go.name, []);
    }

    const list = this.compByGameObject.get(go.name)!;
    list.push(component);

    component.init(go);

    if (component.awake) {
      component.awake();
    }
    if (component.start) {
      this.startQueue.push(component);
    }
  }

  update(dt: number) {
    while (this.startQueue.length > 0) {
      const component = this.startQueue.shift();
      if (component?.start) {
        component.start();
      }
    }
    for (const [, component] of this.compByGameObject.entries()) {
      component.forEach(comp => {
        comp.update ? comp.update(dt) : null;
      });
    }
  }

  destroy() {
    for (const [, component] of this.compByGameObject.entries()) {
      component.forEach(comp => {
        comp.destroy ? comp.destroy() : null;
      });
    }
  }
}
