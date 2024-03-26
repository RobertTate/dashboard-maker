---
title: Dashboard Maker
description: An extension for keeping game content you need on hand.
author: Robert Tate
image: https://raw.githubusercontent.com/RobertTate/dashboard-maker/main/docs/DashboardMaker1.png
icon: https://owlbear-dashboard-maker.vercel.app/icon.svg
tags:
  - other
manifest: https://owlbear-dashboard-maker.vercel.app/manifest.json
learn-more: https://github.com/RobertTate/dashboard-maker
---

# Dashboard Maker

**An Owlbear Rodeo extension for keeping game content you need on hand.**

Whether it's useful notes & reminders, initiative trackers, character sheets, or something else, Dashboard Maker is a place to put it. All content is saved in your browser.

The more you put in Dashboard Maker, the less you have to leave Owlbear Rodeo. Why is this good? Because context switching during a game sucks.

Check it out as a standalone app here: https://owlbear-dashboard-maker.vercel.app/

_(But really, you should be using this in [Owlbear Rodeo](https://www.owlbear.rodeo/))_

<img src="https://raw.githubusercontent.com/RobertTate/dashboard-maker/main/docs/DashboardMakerPreview.gif" alt="Dashboard Maker Preview" width="722">

## Dashboard Types

### Blank Dashboards

![Blank Dashboards](https://raw.githubusercontent.com/RobertTate/dashboard-maker/main/docs/DashboardMaker2.png)

Click **Create A New Dashboard** on the home screen to create a new empty dashboard space.

---

### 5e Character Template Dashboards

![5e Character Template Dashboards](https://raw.githubusercontent.com/RobertTate/dashboard-maker/main/docs/DashboardMaker3.png)

Click **Create A New 5e Character** on the home page to create a new dashboard space using a 5e Character Template.

### Premades

![Dashboard "Premades"](https://raw.githubusercontent.com/RobertTate/dashboard-maker/main/docs/DashboardMaker4.png)

Dashboard Maker comes with a couple of "Premades". These are dashboards that are already there, with some useful DM Screen info particular to D&D 5th Edition.

More "Premades" to come.

## Dashboard Features

<img style="margin-bottom:-4px" src="https://raw.githubusercontent.com/RobertTate/dashboard-maker/main/src/assets/fire.svg" alt="Image Support Example" width="30"> You can delete dashboards as needed.

<img style="margin-bottom:-4px" src="https://raw.githubusercontent.com/RobertTate/dashboard-maker/main/src/assets/locked.svg" alt="Image Support Example" width="30"> You can lock/unlock the state of a dashboard, affecting the editable state of the items within it.

<img style="margin-bottom:-4px" src="https://raw.githubusercontent.com/RobertTate/dashboard-maker/main/src/assets/duplicate.svg" alt="Image Support Example" width="30"> You can clone/duplicate any dashboard as needed. Right now, this is the best way to rename them (duplicate it, give it a new name, and then delete the old one)

<img style="margin-bottom:-4px" src="https://raw.githubusercontent.com/RobertTate/dashboard-maker/main/src/assets/download.svg" alt="Image Support Example" width="30"> You can download/upload dashboards as `json` files, so you can store them offline, share them between browsers, etc!

<img style="margin-bottom:-4px" src="https://raw.githubusercontent.com/RobertTate/dashboard-maker/main/src/assets/share.svg" alt="Image Support Example" width="30"> If you are the GM for a room, you will see an additional button to share your dashboard with all other players in the room. **Be careful with this feature! Sharing your dashboard will overwrite any dashboards your players have with the same dashboard name.**

_Note: If a dashboard reaches over 16kb in size, it can no longer be shared with the sharing feature. I will look for ways to mitigate this further in the future!_

## Images

Dashboard Maker now supports adding images inside a dashboard content box.

<img src="https://raw.githubusercontent.com/RobertTate/dashboard-maker/main/docs/DMImageSupportExample.png" alt="Image Support Example" width="602">

### Prerequisites:

- The image must already be hosted somewhere, thus having a valid image url.

### How To:

1. Right click the image you want to add (this works in a browser or discord) and select "Copy Image"
2. Back in Dashboard Maker, paste that image into a dashboard content box either by right clicking inside the text area and selecting "Paste", or by pressing `ctrl+v` once you've already clicked into the text area (you know you've clicked into the text area if you see the text cursor).

### Caveats:

- While it's not impossible - putting images and text into the same context box is a bit clunky. Consider keeping them seperated into different content boxes.

## Formatting

Here are some text formatting guidelines to help share what's possible with Dashboard Maker.

### Headings

Type `#` and then hit `space` to create an `h1` in the body of your dashboard item text. This pattern applies to `h2`'s (`##`), `h3`'s (`###`), and so on.

### Text Styling

You can apply bold, italics, and underline to text by using the keyboard shortcuts: `ctrl+b` for bold, `ctrl+i` for italics, and `ctrl+u` for underline.

Make sure to use `command` instead of `ctrl` on a mac. 😊

### Checkboxes

Type `[]` and then `space` to create a checkbox. Make sure you type in a label to the right of the checkbox immediately after, or else if you hit return the checkbox will just disappear.

### Bulleted Lists

Type `-` and then hit `space` to create a bulleted list. you can indent lists however much you need using the `tab` key.

### Numbered Lists

Type `1.` and then hit `space` to create a numbered list starting at 1. You can also indent numbered lists with `tab`.

### Code Formatting

To make your text have `that cool code` look, type a backtick ( ` ), followed by the text you want formatted this way, followed by another backtick.

_Have fun! And if you're a dev type, feel free to [check out the source code on Github](https://github.com/RobertTate/dashboard-maker)._
