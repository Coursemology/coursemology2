# frozen_string_literal: true

class Authentication::VerificationService
  Error = Struct.new(:message, :status)
  Response = Struct.new(:decoded_token, :error)
end
