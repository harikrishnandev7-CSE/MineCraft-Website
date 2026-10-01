# Azure Network Security Group (NSG) Rules

| Priority | Name | Port | Protocol | Source | Action |
|----------|------|------|----------|--------|--------|
| 100 | AllowHTTPS | 443 | TCP | Any | Allow |
| 110 | AllowHTTP | 80 | TCP | Any | Allow |
| 120 | AllowSSH | 22 | TCP | Admin IPs | Allow |
| 900 | DenyAllInbound | Any | Any | Any | Deny |
