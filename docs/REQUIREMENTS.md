# Requirements

## Bookmarks

1. A bookmark is a saved link. A folder groups bookmarks.
2. A favicon is an image that identifies a site.
3. The page must show browser bookmarks under their folders.
4. Each bookmark must show its title and favicon.
5. Selecting a bookmark must open its saved link in the browser.
6. The page must reflect changes to bookmarks made in the browser or in another Start Tab page.
7. The user must be able to reach each bookmark with the keyboard.
8. The user must be able to drag a bookmark before or after another bookmark to change its order.
9. A vertical bar must be displayed between the two bookmarks the user has dragged the bookmark to.
10. The user must be able to drag a bookmark onto a folder to move it to that folder.
11. If a bookmark move fails, the page must show an error message.
12. Bookmarks must be displayed in a grid with the favicon and the title below.
13. The user must be able to drag the folder titles to re-order the folders.
14. A horizontal line must be displayed between the two folders that the user has dragged the folder to and must not display a horizontal line between bookmarks.

## Clock and date

1. A tooltip is a short message shown when the pointer rests on text.
2. The page must show the current local time in 24-hour format and the current date.
3. The clock must update at least once per second.
4. When a historical event exists for the current date, the date must show one event and its year in a tooltip.
5. When several events exist for the current date, the page must choose one at random.
6. The user must be able to hide or show the clock in Settings.
7. The historical event list should load after the rest of the page.

## Checklist

1. The page must show a checklist that the user can hide or show in Settings.
2. Hiding the checklist must not remove its items.
3. The user must be able to add, complete, and remove checklist items.
4. The page must show the number of completed items and the total number of items.
5. The page must reject blank items and limit each item to 200 characters.
6. The page must save checklist items in local storage and restore them when Start Tab opens.
7. Input for new checklist items should be aligned to the top and new items added to the top.
8. The panel must scroll vertically when checklist items cannot fit into the panel vertically.
9. The user must be able to drag checklist items to change their order.

## Background and appearance

1. The page must provide a two-color gradient background.
2. The user must be able to choose the start color, end color, and direction of the gradient.
3. The gradient direction options must be diagonal, top to bottom, and left to right.
4. The user must be able to choose no texture or one of the provided background textures.
5. Texture choices must include dots, grid, diagonal stripes, horizontal stripes, and vertical stripes.
6. Texture choices must also include rain drops, honeycomb, isometric dots, small grid, snowflakes, and noise.
7. The page must draw the selected texture over the gradient or image.
8. The user must be able to use a JPEG, PNG, WebP, or GIF image as the background.
9. The page must reject background images larger than 2 MB and show an error for an invalid image.
10. If no image is selected, the page must show the gradient.
11. The user must be able to remove the saved image and return to the gradient.
12. The page must save the background image and background choices in local storage.
13. The page must save clock and checklist visibility choices in local storage.
14. By default, the page must show the clock and checklist with a gray gradient and no texture.
15. The settings dialog must adapt to the system light or dark appearance.
16. When the checklist is visible, the page must show it beside the bookmarks on a large screen.
17. Checklist must be either as long as the page or reach as far as the last bookmark panel, which ever is longer.
18. When the checklist is hidden, the bookmarks must use the full page width.
19. The user must be able to change the tint of the pannels from white through to black using a slider in the Settings.

## Storage and use

1. Start Tab must replace the default new tab page in Chromium browsers.
2. Start Tab must work offline after installation and must not require an account.
3. Local storage means data saved in the browser local storage.
4. The page must provide a Settings control that opens the Settings modal.
5. When local storage is unavailable, the page must remain usable until it closes.
6. The page must update open Start Tab pages when the user changes saved settings or checklist items in another page.
