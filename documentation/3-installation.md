# Installation Instructions

## Prerequisites
- Node.js 18 installed

## Process
1. Clone the repository.
2. Navigate to the code folder in your terminal.
3. Run the following command to install dependencies:
```bash
npm install
```

4. To run the app in your local environment, use the following command:

```bash
npm start
```

These steps will set up and launch the app locally for testing and development.

# Azure

## Prerequisites
1. **Azure Acount**: Go to the [Azure Portal](https://portal.azure.com/) and sign up If you don't have one
2. **Install Azure CLI**:
   - Visit the [Azure CLI installation page](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli) to find the installation instructions for your operating system (Windows, macOS, Linux).

3. **Log In**:
   - To start using the Azure CLI, run the following command and follow the instructions to log in using your Azure account:
     ```bash
     az login
     ```
4. **Register Subscription Resource Providers**: Make sure that following resource providers are Registered:
    - Microsoft.Web
    - Microsoft.KeyVault
    - Microsoft.Storage
    - Microsoft.ApiManagement
    - Microsoft.ManagedIdentity


## Deploy Process

Once Azure settings are properly configured in the Azure Portal and the Azure CLI is installed and logged in, you're ready to initiate the deployment process.

If this is the first deployment, the process will create all the necessary resources on Azure, including:
- A Resource Group (all subsequent resources will be deployed within this group, making it easy to remove all used resources by simply deleting the group).
- Storage Account
- Azure Vault
- API Management
- Azure Functions

For subsequent deployments, the process will only deploy the services that have changed since the last deployment. This optimizes the deployment process and reduces unnecessary updates to unchanged resources.
### Azure Vault (Sending Mail)

For the purpose of sending emails, the app leverages Azure Vault as the Secrets service. To enable email functionality, follow these steps:

1. **Add Secret to Azure Vault**:
   - In the Azure Portal, navigate to your Azure Key Vault.
   - Add a new secret named `SENDGRID`.
   - The value of this secret should be a JSON object that contains the necessary configuration for sending emails.  
```json
    { 
        "key": "your_sendgrid_api_key", 
        "sender": "email registered as sender in SendGrid Portal" 
    }
   ```
   
2. **Configuring Email Functionality**:
   - Within the app's codebase, locate the section responsible for sending emails (/services/main/routes/forgotpwd_POST.js). If necessary, uncomment the relevant part of the code.
   - The app will retrieve the necessary email configuration from the `SENDGRID` secret in Azure Vault.

Please note that if you're not using email functionality,  setting the `SENDGRID` secret is not necessary.

By using Azure Vault for storing sensitive information, you ensure a secure and centralized method for managing secrets and configurations.


### API Gateway (Azure API Management Services)

As detailed in the DEMO App Architecture section, the deploy process can provision an Azure API Management Service. It's important to note that setting up the API Management Service can be time-consuming, ranging from 30 minutes to over an hour. However, it's essential to understand that this step is only necessary in environments where multiple functions are utilized. In cases where only one function is present, setting up the API Management Service might not be logical.

To streamline the deployment process and exclude the provisioning of the API Gateway and registration of API endpoints, follow these steps:

1. **Modify Function Configuration**:
   - Locate the `/env/azure/kinds/function/function.js` file within the app's codebase.
   - Comment out the line `api.registerService(in_meta)` by adding `//` at the beginning of the line.

By following these steps, you can effectively prevent the provisioning of the API Gateway and the registration of API endpoints for Azure Functions. This approach is particularly useful when deploying environments that involve a single function, reducing deployment time and unnecessary complexities.

Remember to adjust this configuration based on the specific requirements of your deployment.




