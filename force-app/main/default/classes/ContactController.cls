public WITH sharing class ContactController {   
 
 
    //DELETE multiple contact record IN LWC
     @AuraEnabled(cacheable=TRUE)
     public static List<Contact> fetchContactRecord(){
        List<Contact> conList = [SELECT Id, FirstName, LastName, Email, Phone FROM Contact ORDER BY createdDate DESC LIMIT 10 ];
        RETURN conList;
     }
  
     @AuraEnabled
     public static List<Contact> deleteMultipleContactRecord(List<String> conObj){
        List<Contact> conObjItem = NEW List<Contact>();
        List<Contact> conObjList = [SELECT Id, Name  FROM Contact WHERE Id IN:conObj];
        
        FOR(Contact con:conObjList){
            conObjItem.add(con);
        }

        IF(conObjItem.size()>0){
           try{
             DELETE conObjItem;           
           }
           catch (Exception EXP) {
             throw NEW AuraHandledException(EXP.getMessage());
         }
       }
       RETURN fetchContactRecord();
     }
  
 }