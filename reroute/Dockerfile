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

RUN npm install express
RUN npm install http-proxy
# Expose the port (if needed)
EXPOSE 8443
EXPOSE 3000

# Start the application
CMD ["node", "app.js" ]

