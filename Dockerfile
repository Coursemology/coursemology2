# Use the Ruby 3.3.5 image
FROM ruby:3.3.5

# Install necessary dependencies
RUN apt-get update -qq && apt-get install -y nodejs postgresql-client

# Set the working directory
WORKDIR /app

# Copy the Gemfile and Gemfile.lock
COPY Gemfile Gemfile.lock ./

# Install gems
RUN bundle install

# Copy the rest of the app code
COPY . .

# Start the Rails server
CMD ["bundle", "exec", "rails", "s", "-p", "3000", "-b", "0.0.0.0"]
