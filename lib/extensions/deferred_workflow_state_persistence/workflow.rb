# frozen_string_literal: true
require 'workflow-activerecord'

module Extensions::DeferredWorkflowStatePersistence::Workflow; end
module Extensions::DeferredWorkflowStatePersistence::Workflow::Adapter; end
module Extensions::DeferredWorkflowStatePersistence::Workflow::Adapter::DeferredActiveRecord
  extend ActiveSupport::Concern
  included do
    include WorkflowActiverecord::Adapter::ActiveRecord
    include InstanceMethods
  end

  module InstanceMethods
    def persist_workflow_state(new_value)
      write_attribute(self.class.workflow_column, new_value)
      true
    end
  end
end
