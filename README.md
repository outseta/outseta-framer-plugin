# Outseta Framer Plugin

Outseta Framer Plugin allows you to integrate Outseta into your Framer sites directly from the Framer Canvas.

## Development

1. Run the development server:

```bash
npm run dev
```

2. Enable Plugin Developer Tools: **Project Menu > Plugins > Show Developer Tools**.
3. Open the plugin: **Plugins > Development > Open Development Plugin**.

Learn more: https://developers.framer.wiki/

## Publishing

When your Plugin is ready, you can submit it to the Framer Marketplace to share it with the community. Once approved, anyone using Framer will be able to use your Plugin.

### Preparing

1. Ensure your Plugin icon and name is correct.
2. Test all core flows and functionality of your Plugin.
3. Test with different project states and browsers.
4. Check your Plugin UI in both dark & light mode.

### Submitting

1. Select "New Plugin" in the Marketplace dashboard.
2. Run `npm run pack` in the root of your Plugin directory.
3. Upload the `plugin.zip` file created by the command.
4. Fill in the rest of the form and submit your Plugin.

### Updating

1. Make your changes to your Plugin code.
2. Run `npm run pack` again to update the zip.
3. Upload the new zip to the Marketplace UI.
