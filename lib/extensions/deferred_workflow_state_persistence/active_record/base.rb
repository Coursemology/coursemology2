module Extensions::DeferredWorkflowStatePersistence::ActiveRecord::Base
  module ClassMethods
    def workflow_adapter
      Extensions::DeferredWorkflowStatePersistence::Workflow::Adapter::DeferredActiveRecord
    end
  end
end
