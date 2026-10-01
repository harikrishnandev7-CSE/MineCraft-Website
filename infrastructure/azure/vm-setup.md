# Azure VM Provisioning

```bash
# Create Resource Group
az group create --name mindcraft-rg --location eastus

# Deploy Ubuntu VM
az vm create \
  --resource-group mindcraft-rg \
  --name mindcraft-vm \
  --image Ubuntu2204 \
  --size Standard_D4s_v5 \
  --admin-username azureuser \
  --generate-ssh-keys
```
