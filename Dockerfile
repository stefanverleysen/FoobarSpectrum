# Use an official Nginx image as a base image
FROM nginx:latest

# Copy the content of the local "static_code" directory to the default Nginx document root
COPY static_code /usr/share/nginx/html

# Expose port 80
EXPOSE 80