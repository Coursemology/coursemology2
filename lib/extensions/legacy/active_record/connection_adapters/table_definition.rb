module Extensions::Legacy::ActiveRecord::ConnectionAdapters::TableDefinition
  module PrependMethods
    def userstamps(*args)
      super(false, *args)
    end

    def actable(*args, **kwargs)
      kwargs[:index] ||= :unique
      super(*args, **kwargs)
    end
  end
end
