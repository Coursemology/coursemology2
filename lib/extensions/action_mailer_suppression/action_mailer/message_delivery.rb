# This extension disables the check introduced in rails/rails#24457, which disables the
# accessing or mutation of the +MessageDelivery+ object through raising an exception.
#
# Since Coursemology uses mailing templates (see #mail in +ActivityMailer+), this
# extension reverses that patch.
#
# See rails/rails#26916 for potential progress / discussions on this issue,
# or consider building a custom ActiveJob instead of #deliver_later.
module Extensions::ActionMailerSuppression::ActionMailer::MessageDelivery
  module PrependMethods
    def processed?
      false
    end
  end
end
