# frozen_string_literal: true
class AttachmentReference < ActiveRecord::Base
  belongs_to :attachable, polymorphic: true, inverse_of: nil
  belongs_to :attachment, inverse_of: :attachment_references

  delegate :open, :url, :path, to: :attachment
end
