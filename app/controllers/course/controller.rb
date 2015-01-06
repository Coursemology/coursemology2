class Course::Controller < ApplicationController
  load_and_authorize_resource :course
end
