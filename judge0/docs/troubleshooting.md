# Troubleshooting Judge0

### Common Issues
- **Permission denied (cgroups)**: Ensure Docker runs with cgroup v1 or compatibility flags enabled.
- **Worker starvation**: Increase worker count if queue latency increases.
- **Redis connection failure**: Check if `judge0-redis` is healthy.
