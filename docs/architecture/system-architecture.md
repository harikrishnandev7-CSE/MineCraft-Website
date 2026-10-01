# System Architecture

Mind Craft is an end-to-end distributed competition platform connecting real-world QR tracking with a high-performance cloud sandbox.

```
+-------------------------+            +-------------------------+
|     Participant SPA     | <--------> |   Express REST Backend  |
| (React, Vite, Redux)    |   HTTPS    |  (Node.js, Auth, Logic) |
+-------------------------+            +-------------------------+
                                                    |
                                      +-------------+-------------+
                                      |                           |
                                      v                           v
                          +--------------------+      +--------------------+
                          |  MongoDB & Redis   |      |   Judge0 Cluster   |
                          | (Data & Sessions)  |      | (Isolated Sandbox) |
                          +--------------------+      +--------------------+
```
