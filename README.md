# Ztereo.io
This is an attempt to ~~copy~~ remake the game Agar.io in node.js and P5.js.

## TODOs
- Move player movement/food server side
    - Everything should be server-side, ideally the player would only send their rotation and the server would normalise it.
- Fix broken player eating check code => first skip if they are the same.
- Make them bois grow when eating
- Clean up code and rename socket thingies.
- Make the server broadcast new players joining, currently i dont even understand why the code is working.
- Make the colours be assigned based on the ID and make players have a name.
- Make an UI where players can connect and choose name and where they end up when dying.

## TODON'Ts
- Splitting and merging. Don't even think of that nightmare. (I do accept contributions though)

## Know bugs
- Players die for no reason
- Players become invisible
