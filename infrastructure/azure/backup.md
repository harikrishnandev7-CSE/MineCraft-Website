# Disaster Recovery & Database Backups

Automated snapshot cron job:
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker exec mindcraft-mongo mongodump --out /backup/mongo_$DATE
az storage blob upload-batch -d backups -s /backup/mongo_$DATE --account-name mindcraftbackups
```
