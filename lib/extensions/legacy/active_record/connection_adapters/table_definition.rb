module Extensions::Legacy::ActiveRecord::ConnectionAdapters::TableDefinition
  module PrependMethods
    def actable(*args, **kwargs)
      kwargs[:index] ||= :unique
      super(*args, **kwargs)
    end
  end
end
