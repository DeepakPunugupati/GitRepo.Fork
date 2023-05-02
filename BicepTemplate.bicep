param location string = 'eastus'

resource vnet 'Microsoft.Network/virtualNetworks@2020-05-01' = {
  name: 'VirtualNet'
  location: location
  properties: {
    addressSpace: {
      addressPrefixes: [
        '192.168.0.0/16'
      ]
    }
    subnets: [
      {
        name: 'sub1'
        properties: {
          addressPrefix: '192.168.1.0/24'
        }
      }
      {
        name: 'sub2'
        properties: {
          addressPrefix: '192.168.2.0/24'
        }
      }
    ]
  }
}

resource nic1 'Microsoft.Network/networkInterfaces@2020-05-01' = {
  name: 'Nic1'
  location: location
  dependsOn: [
    vnet
  ]
  properties: {
    ipConfigurations: [
      {
        name: 'myIpConfig'
        properties: {
          subnet: {
            id: resourceId('Microsoft.Network/virtualNetworks/subnets', 'VirtualNet', 'sub1')
          }
          privateIPAllocationMethod: 'Dynamic'
        }
      }
    ]
  }
}

resource vm1 'Microsoft.Compute/virtualMachines@2020-06-01' = {
  name: 'VirM1'
  location: location
  dependsOn: [
   nic1
  ]
  properties: {
    hardwareProfile: {
      vmSize: 'Standard_B1ls'
    }
    storageProfile: {
      imageReference: {
        publisher: 'Canonical'
        offer: 'UbuntuServer'
        sku: '18.04-LTS'
        version: 'latest'
      }
      osDisk: {
        name: 'myVMosdisk'
        caching: 'ReadWrite'
        createOption: 'FromImage'
      }
    }
    osProfile: {
      computerName: 'VirM1'
      adminUsername: 'adminUsername'
      adminPassword: 'Pass@10240001'
    }
    networkProfile: {
      networkInterfaces: [
        {
          id: resourceId('Microsoft.Network/networkInterfaces', 'NIC1')
        }
      ]
    }
  }
}

resource nic2 'Microsoft.Network/networkInterfaces@2020-05-01' = {
  name: 'Nic2'
  location: location
  dependsOn: [
    vnet
  ]
  properties: {
    ipConfigurations: [
      {
        name: 'myIpConfig'
        properties: {
          subnet: {
            id: resourceId('Microsoft.Network/virtualNetworks/subnets', 'VirtualNet', 'sub2')
          }
          privateIPAllocationMethod: 'Dynamic'
        }
      }
    ]
  }
}
resource vm2 'Microsoft.Compute/virtualMachines@2020-06-01' = {
  name: 'VirM22'
  location: location
  dependsOn: [
   nic2
  ]
  properties: {
    hardwareProfile: {
      vmSize: 'Standard_B1ls'
    }
    storageProfile: {
      imageReference: {
        publisher: 'MicrosoftWindowsServer'
        offer: 'WindowsServer'
        sku: '2022-datacenter'
        version: 'latest'
      }
      osDisk: {
        name: 'myOsDisk'
        createOption: 'FromImage'
      }
    }
    osProfile: {
      computerName: 'VirM2'
      adminUsername: 'adminUsername'
      adminPassword: 'Pass@10240001'
      windowsConfiguration: {
        provisionVMAgent: true
      }
    }
    networkProfile: {
      networkInterfaces: [
        {
          id: resourceId('Microsoft.Network/networkInterfaces', 'Nic2')
        }
      ]
    }
  }
}
