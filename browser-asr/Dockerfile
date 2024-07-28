FROM ubuntu:22.04 

# Install bash and other dependencies
RUN apt update -y
RUN apt install nodejs -y
RUN apt install npm -y
#RUN npx yarn
# Set working directory
#dORKDIR /SOURCE


# Install dependencies
# Copy the rest of the application code
COPY . /

RUN npm install
# Expose the port (if needed)
EXPOSE 3000
ENV NODE_ENV=development
# Start the application
CMD ["npm", "run", "start"]

