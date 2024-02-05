public with sharing class LWCProject {   
 
 
   //Fetch all custom task
    @AuraEnabled(cacheable=TRUE)
    public static List<CustomTask__c> fetchCustomTask(){
        List<CustomTask__c> customTaskList = [SELECT Id, Name, Description__c, Due_Date__c
                                              FROM CustomTask__c LIMIT 100];
        return customTaskList;
    }
    
    //Delete custom task(s)
    @AuraEnabled
    public static List<CustomTask__c> deleteCustomTask(List<String> ctObj){
        
      List<CustomTask__c> ctItem = new List<CustomTask__c>();
      List<CustomTask__c> ctList = [SELECT Id, Name 
                                    FROM CustomTask__c WHERE Id IN:ctObj];
      
      for(CustomTask__c ct : ctList){
        ctItem.add(ct);
      }
      
      if(ctItem.size()>0){
        try {
          delete ctItem;
        }
        catch (Exception e) {
          throw new AuraHandledException(e.getMessage());
        }
      }

      return fetchCustomTask();
    }
 
}