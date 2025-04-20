from azure.communication.identity import CommunicationIdentityClient

# Replace this with your real ACS connection string
connection_string = "endpoint=https://videocallacs.unitedstates.communication.azure.com/;accesskey=6dgUuyT0melhLdqDXs5OBUTviWui5zWQbIcrFD2z4gWi8YudVsEcJQQJ99BDACULyCpJKLX8AAAAAZCSUDwB"

# Create the client
client = CommunicationIdentityClient.from_connection_string(connection_string)

# Create a new user and issue a token
user = client.create_user()
token_response = client.get_token(user, scopes=["voip", "chat"])

print("User ID:", user.properties['id'])
print("Token:", token_response.token)
