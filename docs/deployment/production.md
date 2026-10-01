# Production Deployment

Production checklist:
1. Ensure SSL certificates are active in Nginx.
2. Enable UFW firewall and NSG policies.
3. Configure MongoDB replica sets and persistent EBS/Azure disk mounts.
4. Scale Judge0 workers to match anticipated participant volume.
