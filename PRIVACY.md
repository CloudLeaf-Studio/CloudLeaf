# Browser Extension Privacy Policy

([中文版](PRIVACY_zh.md))

**Effective Date:** 2026-10-10

**CloudLeaf** (hereinafter referred to as "this Extension") is committed to protecting your privacy. This policy explains what data this Extension processes, why it is needed, and how it is handled.

CloudLeaf does not operate its own account system, cloud storage service, analytics service, advertising service, or backend server. The Extension does not collect telemetry, usage analytics, crash reports, or advertising data.

## 1. Information We Process

The Extension processes the following information only when needed to provide its features:

**Browser bookmarks:** The Extension reads, compares, counts, hashes, and may modify your browser bookmarks to provide manual and automatic synchronization. Bookmark data is processed locally and may be transmitted to a cloud provider configured by you.

**Cloud provider configuration and credentials:** The Extension stores configuration for the providers you choose, including one or more GitHub Gist configurations, Gist IDs, GitHub tokens, WebDAV server addresses, usernames, passwords, file paths, custom WebDAV vendor information, and synchronization settings. These values are stored in the browser's extension-local storage and are not sent to CloudLeaf servers.

**Synchronization state and local cache:** The Extension stores synchronization state, including local modification time, synchronization phase, baseline information, and local/cloud bookmark count caches. This information is stored locally to coordinate synchronization and display status in the Extension interface.

**Local JSON files:** When you use import or export, the Extension reads a JSON file selected by you or writes bookmarks to a file selected by you. These files are not uploaded to CloudLeaf servers.

## 2. How We Use Data

The Extension uses this information only to read and modify browser bookmarks, synchronize bookmarks between your browser and your configured GitHub Gist or WebDAV provider, authenticate with that provider, detect synchronization conflicts, run automatic synchronization when enabled, preview cloud bookmarks, and import or export local JSON files.

CloudLeaf does not share, sell, or rent your data. Data sent to a configured GitHub or WebDAV provider is sent directly from your browser to that provider. The provider may process the data according to its own privacy policy and terms of service.

## 3. Third-Party Cloud Providers

When you configure GitHub Gist, the Extension sends bookmark data and authentication requests directly to the GitHub API. The visibility and access permissions of the target Gist are controlled by you through GitHub.

When you configure WebDAV, the Extension sends bookmark data and authentication requests directly to the WebDAV server you provide, including custom WebDAV endpoints. You are responsible for selecting the server and managing its access permissions.

CloudLeaf does not receive, proxy, or retain the bookmark data or credentials sent to these providers.

## 4. Browser Permissions and Their Use

### `storage`

The Extension uses this permission to store provider configuration, GitHub tokens, Gist IDs, WebDAV server details, credentials, custom vendor information, synchronization settings, synchronization state, and local/cloud bookmark count caches in browser extension-local storage.

### `sidePanel`

The Extension uses this permission to provide a dedicated sidebar for previewing cloud bookmark lists, displaying synchronization information, and opening bookmark links without opening the Extension popup.

### `alarms`

The Extension uses this permission to periodically trigger automatic bookmark synchronization when Auto Sync is enabled, including when the Extension interface is closed. The synchronization request is initiated by the user's browser and is sent directly to the configured provider.

### `bookmarks`

The Extension uses this permission to read local bookmark data, listen for bookmark creation, deletion, modification, movement, and reordering events, calculate local bookmark state, compare local and cloud bookmarks, detect conflicts, and apply cloud bookmarks to the browser.

### Host permissions

The Extension requests `https://*/*` host access so it can communicate with the GitHub API and with WebDAV servers configured by the user, including custom HTTPS WebDAV endpoints. These requests are used for provider authentication and bookmark synchronization. The Extension does not use this access to send data to CloudLeaf servers.

## 5. Local File Import and Export

Export creates a JSON file containing the bookmark synchronization payload and downloads it through the browser. Import reads a JSON file selected by you and may apply its bookmark data to the browser after you confirm the operation. The Extension does not upload these local files to CloudLeaf servers.

## 6. Data Security

The Extension uses the browser's extension-local storage for configuration, credentials, synchronization state, and local caches. Credentials are used only to communicate directly with the provider configured by you. The Extension does not provide an additional encryption layer for values stored in browser extension storage; you should protect your browser profile and provider accounts accordingly.

## 7. Data Retention

CloudLeaf does not retain your personal data on its servers because it does not operate a server-side data service. Data remains in your browser, your selected local files, and the cloud provider configured by you. You can remove local Extension data through the browser and manage or delete cloud data through the relevant provider.

## 8. User Rights and Data Deletion

You can delete the Extension and its locally stored data, remove provider configurations and credentials, delete exported local files, and manage or delete synchronized data through GitHub or your WebDAV provider.

To ask questions about this policy or our data practices, contact us at [3433800035@qq.com](mailto:3433800035@qq.com).

## 9. Changes to This Privacy Policy

We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated effective date. We encourage you to review this policy periodically.

## 10. Contact Us

If you have any questions or concerns about this Privacy Policy or our data practices, please contact us:

**Email:** [3433800035@qq.com](mailto:3433800035@qq.com)
