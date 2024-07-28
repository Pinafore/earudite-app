FROM ubuntu:22.04 

# Install bash and other dependencies
RUN apt update -y
RUN apt install nodejs -y
RUN apt install npm -y
#RUN npx yarn
# Set working directory
WORKDIR /SOURCE


# Install dependencies

# Copy the rest of the application code
COPY . .
RUN npm i
# Expose the port (if needed)
EXPOSE 6800

# Start the application
RUN npx pm2 start server.js --name ASRQA -o ./out.log -e ./err.log  
CMD [ "npx", "pm2", "save", "--force"]

#CMD ["node", "app.js" ]

