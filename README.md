# Dashboard Maker

### An [Owlbear Rodeo](https://www.owlbear.rodeo/) extension for keeping game content you need on hand.

Whether it's useful notes & reminders, initiative trackers, character sheets, or something else, Dashboard Maker is a way to keep it in Owlbear Rodeo.

You get fun boxes to drag around, [markdown style text shortcuts](#formatting-keyboard-shortcuts), a decked out [editing bar](#the-toolbar), and a [magic dice syntax](#dice-notation) that lets you roll 3d dice in the app. All the things a TTRPG note-taking enthusiast could want.

Additionally, a folder system is in place to help you organize your dashboards however you see fit.

All content is saved in your browser. Dashboards are also downloadable, uploadable, and shareable between the GM and their players.

**The more you put in Dashboard Maker, the less you have to leave Owlbear Rodeo. Why is this good? Because context switching during a game sucks.**

Check it out as a standalone app [here](https://owlbear-dashboard-maker.vercel.app/).

_(But really, you should be using this in [Owlbear Rodeo](https://www.owlbear.rodeo/))_

<img src="./docs/DashMakerNewIntro.gif" alt="Dashboard Maker Preview" width="722">

## Dashboard Types

### Blank Dashboards

<img src="./docs/DashMakerBlankDash1.png" alt="Blank Dashboards" width="722">

Click **Create A New Dashboard** on the home screen to create a new empty dashboard.

---

### 5e Character Template Dashboards

<img src="./docs/DashMakerNew5eSheet.png" alt="5e Character Template Dashboards" width="722">

Click **Create A New 5e Character** on the home page to create a new dashboard that uses a 5e character template.

### Premades

<img src="./docs/DashMakerPremadeDash1.png" alt="Dashboard Premades" width="722">

Dashboard Maker comes with some "Premades". These are dashboards that I made to offer some useful DM Screen info, right now specifically for D&D 5th Edition.

## Dashboard Features

<img style="margin-bottom:-4px" src="./src/assets/fire.svg" alt="Delete Icon" width="30"> You can delete dashboards as needed.

<img style="margin-bottom:-4px" src="./src/assets/locked.svg" alt="Locked Icon" width="30"> You can lock/unlock the state of a dashboard, affecting the editable state of the items within it.

<img style="margin-bottom:-4px" src="./src/assets/toggle.svg" alt="Toggle Icon" width="30"> You can toggle the base number of columns in a dashboard, between either 8 (default) or 12 columns. Note: this only affects the dashboard layout on desktop. Mobile layout is still set to a base of 4 columns.

<img style="margin-bottom:-4px" src="./src/assets/duplicate.svg" alt="Duplicate Icon" width="30"> You can clone/duplicate any dashboard as needed. Right now, this is the best way to rename them (duplicate it, give it a new name, and then delete the old one)

<img style="margin-bottom:-4px" src="./src/assets/download.svg" alt="Download Icon" width="30"> You can download/upload dashboards as `json` files, so you can store them offline, share them between browsers, etc!

<img style="margin-bottom:-4px" src="./src/assets/share.svg" alt="Share Icon" width="30"> If you are the GM for a room, you will see an additional button to share your dashboard with all other players in the room. **Be careful with this feature! Sharing your dashboard will overwrite any dashboards your players have with the same dashboard name.**

## Dice Notation

Dashboard Maker now supports a dice notation syntax. Simply type things like "1d6+3" in the editor, hit space, and watch as the text gets captured as "dice notation". Then, you just click on what you typed, and it will roll those dice.

<img src="./docs/DashMakerDicePreview.gif" alt="Dashboard Maker Dice Preview" width="722">

For more information on the full list of dice notation syntax that Dashboard Maker will recognize & accept, take a look at the `⭐ Dice Demo ⭐` premade dashboard, which can be found in `Home → Premades → 5th Edition D&D` dashboard folder.

<img style="margin-bottom:-4px" src="./src/assets/shareRoll.svg" alt="Share Icon" width="30"> For GM's, this button will appear when your roll result is displayed. Clicking it will share your roll result with the room.

For Players, your roll is shared automatically.

## Dashboard Searching

Dashboard Maker now comes with an option to tie a token to a dashboard. It's pretty simple: if you have a dashboard named "Boblin" and you also have a token that you've added and named "Boblin", you can use the Dashboard Search option in the token's menu to automatically bring up that dashboard with the matching name.

<img src="./docs/DashboardSearchExample.gif" alt="Dashboard Maker Search Example" width="722">

Please note: The token name and the dasboard name must be an exact match for this feature to work.

## Images

Dashboard Maker now supports adding images inside a dashboard content box.

<img src="./docs/DashMakerImageExample.png" alt="Image Support Example" width="722">

### Prerequisites:

- The image must already be hosted somewhere, thus having a valid image url.

### How To:

1. Right click the image you want to add (this works in a browser or discord) and select "Copy Image"
2. Back in Dashboard Maker, paste that image into a dashboard content box either by right clicking inside the text area and selecting "Paste", or by pressing `ctrl+v` once you've already clicked into the text area (you know you've clicked into the text area if you see the text cursor).

### Caveats:

- While it's not impossible - putting images and text into the same context box is a bit clunky. Consider keeping them seperated into different content boxes.

## The Toolbar

<img src="./docs/DashboardMakerToolbar1.png" alt="Toolbar Example" width="722">

**Dashboard Maker now comes with an editing toolbar.** This lets you edit and format your content with ease, and also allows you to drop in new content types such as tables, thematic breaks, links, and admonitions.

## Formatting Keyboard Shortcuts

In addition to using the toolbar, Dashboard Maker also supports keyboard shortcuts to format your content while typing.

### Headings

Type `#` and then hit `space` to create an `h1` in the body of your dashboard item text. This pattern applies to `h2`'s (`##`), `h3`'s (`###`), and so on.

### Text Styling

You can apply bold, italics, and underline to text by using the keyboard shortcuts: `ctrl+b` for bold, `ctrl+i` for italics, and `ctrl+u` for underline.

Make sure to use `command` instead of `ctrl` on a mac. 😊

### Block Quotes

Type `>` and then hit `space` to create a block quote.

### Checkboxes

Type `[]` and then `space` to create a checkbox. Make sure you type in a label to the right of the checkbox immediately after, or else if you hit return the checkbox will just disappear.

### Bulleted Lists

Type `-` and then hit `space` to create a bulleted list. you can indent lists however much you need using the `tab` key.

### Numbered Lists

Type `1.` and then hit `space` to create a numbered list starting at 1. You can also indent numbered lists with `tab`.

### Code Formatting

To make your text have `that cool code` look, type a backtick ( ` ), followed by the text you want formatted this way, followed by another backtick.

_Have fun and thank you for trying out this passion project!_
