class ApplicationMailer < ActionMailer::Base
  default from: 'noreply@coursemology.com',
          'Content-Transfer-Encoding' => '7bit'
  layout 'mailer'
end
