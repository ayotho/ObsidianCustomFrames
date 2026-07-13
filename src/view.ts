import { ItemView, WorkspaceLeaf, Menu } from "obsidian";
import { CustomFrame } from "./frame";
import { CustomFrameSettings, CustomFramesSettings, getIcon } from "./settings";

export class CustomFrameView extends ItemView {

    private static readonly actions: Action[] = [
        {
            name: "Return to original page",
            icon: "home",
            action: v => v.frame.return()
        }, {
            name: "Open dev tools",
            icon: "binary",
            action: v => v.frame.toggleDevTools()
        }, {
            name: "Copy link",
            icon: "link",
            action: v => navigator.clipboard.writeText(v.frame.getCurrentUrl())
        }, {
            name: "Open in browser",
            icon: "globe",
            action: v => open(v.frame.getCurrentUrl())
        }, {
            name: "Refresh",
            icon: "refresh-cw",
            action: v => v.frame.refresh()
        }, {
            name: "Go forward",
            icon: "arrow-right",
            action: v => v.frame.goForward()
        }, {
            name: "Go back",
            icon: "arrow-left",
            action: v => v.frame.goBack()
        }
    ];

    private readonly data: CustomFrameSettings;
    private readonly name: string;
    private frame: CustomFrame;
    private faviconUrl = "";

    constructor(leaf: WorkspaceLeaf, settings: CustomFramesSettings, data: CustomFrameSettings, name: string) {
        super(leaf);
        this.data = data;
        this.name = name;
        this.frame = new CustomFrame(settings, data, favicon => {
            this.faviconUrl = favicon;
            this.updateFavicon();
        });
        this.navigation = data.openInCenter;

        this.registerEvent(this.app.workspace.on("active-leaf-change", activeLeaf => {
            if (activeLeaf == this.leaf && this.faviconUrl)
                this.updateFavicon();
        }));

        for (let action of CustomFrameView.actions)
            this.addAction(action.icon, action.name, () => action.action(this));
    }

    onload(): void {
        this.contentEl.empty();
        this.contentEl.addClass("custom-frames-view");
        this.frame.create(this.contentEl);
    }

    onPaneMenu(menu: Menu, source: string): void {
        super.onPaneMenu(menu, source);
        for (let action of CustomFrameView.actions) {
            menu.addItem(i => {
                i.setTitle(action.name);
                i.setIcon(action.icon);
                i.onClick(() => action.action(this));
            });
        }
    }

    getViewType(): string {
        return this.name;
    }

    getDisplayText(): string {
        return this.data.displayName;
    }

    getIcon(): string {
        return getIcon(this.data);
    }

    private updateFavicon(): void {
        let tabHeader = (this.leaf as any).tabHeaderEl as HTMLElement;
        let icon = tabHeader?.querySelector<HTMLElement>(".workspace-tab-header-inner-icon");
        if (!icon || !this.faviconUrl)
            return;

        icon.empty();
        let container = icon.createDiv({ cls: "custom-frames-favicon-container" });
        let image = container.createEl("img");
        image.src = this.faviconUrl;
        image.alt = "";
    }

    focus(): void {
        this.frame.focus();
    }
}

interface Action {
    name: string;
    icon: string;
    action: (view: CustomFrameView) => any;
}
