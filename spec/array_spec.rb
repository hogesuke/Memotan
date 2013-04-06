# coding: utf-8

describe Array, "when empty" do
  
  before do
    @empty_array = []
  end
  
  it "should be empty" do
    @empty_array.should be_empty
  end
  
  it "should size 0" do
    @empty_array.size.should == 0
  end
  
  after do
    @empty_array = nil
  end
  
  describe Array, "when initialized with object" do
    before do
      @array = Array.new(3){Hash.new}
      @array[0][:cat] = "Nuko"
    end
    
    it "should not affect others" do
      @array.should == [{:cat => "Nuko"}, {}, {}]
    end
  end
end