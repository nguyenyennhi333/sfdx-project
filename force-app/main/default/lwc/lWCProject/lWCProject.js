import { LightningElement, wire, api, track } from 'lwc';
import fetchCustomTask from '@salesforce/apex/LWCProject.fetchCustomTask';
import deleteCustomTask from '@salesforce/apex/LWCProject.deleteCustomTask';
import CUSTOMTASK_OBJECT from "@salesforce/schema/CustomTask__c";
import SUBJECT_FIELD from "@salesforce/schema/CustomTask__c.Name";
import DUEDATE_FIELD from "@salesforce/schema/CustomTask__c.Due_Date__c";
import DESCRIPTION_FIELD from "@salesforce/schema/CustomTask__c.Description__c";
import STATUS_FIELD from "@salesforce/schema/CustomTask__c.Status__c";
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';
 
 
export default class lWCProject extends NavigationMixin(LightningElement) {
    @api columns = [
        { label: 'Subject', fieldName: 'Name', type:'text', sortable: "true"},
        { label: 'Description', fieldName: 'Description__c',type:'text'},
        { label: 'Status', fieldName: 'Status__c', type:'text', sortable: "true"},       
        { label: 'Due Date', fieldName: 'Due_Date__c', type:'Date', sortable: "true"},
    ];

    //variables of lightning-record-form to create record
    objApiName = CUSTOMTASK_OBJECT;
    fields = [SUBJECT_FIELD, DUEDATE_FIELD, DESCRIPTION_FIELD, STATUS_FIELD];
 
 
    @api customTaskIdList=[];
    
    @track customTaskObject;
    @track wiredCustomTask;
    @track data;
    @track error;
    @track errorMsg;
    @track sortBy;
    @track sortDirection;
    @track showCreateRecordForm = false;

    
    @wire (fetchCustomTask) 
    wireCustomTask (result) {
        this.wiredCustomTask = result;
        const { data, error } = result;
        if (data) {
            this.data = data;
            this.error = undefined;
        }
        if (error) {
            this.error = error;
            this.data = undefined;
        }
    };

    doSorting(event) {
        this.sortBy = event.detail.fieldName;
        this.sortDirection = event.detail.sortDirection;
        this.sortData(this.sortBy, this.sortDirection);
    } 

    sortData(fieldname, direction) {
        let parseData = JSON.parse(JSON.stringify(this.data));
        // Return the value stored in the field
        let keyValue = (a) => {
            return a[fieldname];
        };
        // cheking reverse direction
        let isReverse = direction === 'asc' ? 1: -1;
        // sorting data
        parseData.sort((x, y) => {
            x = keyValue(x) ? keyValue(x) : ''; // handling null values
            y = keyValue(y) ? keyValue(y) : '';
        // sorting values based on direction
            return isReverse * ((x > y) - (y > x));
        });
        this.data = parseData;
    } 

    getSelectedIdAction(event){
        const selectedCustomTaskRows = event.detail.selectedRows;
        console.log('selectedCustomTaskRows# ' + JSON.stringify(selectedCustomTaskRows));
        this.selectedCustomTaskRows=[];

        if (this.selectedCustomTaskRows.length == 0) {
            this.customTaskIdList = [];
        }

        for (let i = 0; i<selectedCustomTaskRows.length; i++){
            this.customTaskIdList.push(selectedCustomTaskRows[i].Id);
        }
        console.log('Custom Task List',JSON.stringify(this.customTaskIdList));
    }
        
 
    deleteCustomTaskRowAction(){
        if (this.customTaskIdList.length > 0) {
            deleteCustomTask({ ctObj : this.customTaskIdList })
            .then((result)=>{
                this.template.querySelector('lightning-datatable').selectedCustomTaskRows=[];
                const toastEvent = new ShowToastEvent({
                    title:'Success!',
                    message:'Record(s) deleted successfully',
                    variant:'success'
                });
                this.dispatchEvent(toastEvent);
                return refreshApex(this.wiredCustomTask);
            })
            .catch((error) =>{
                this.errorMsg = error;
                console.log('unable to delete the record due to ' + JSON.stringify(this.errorMsg));
            });
        } else {
            return;
        }
    }

    openCreateRecordForm() {
        this.showCreateRecordForm = true;
    }

    closeCreateRecordForm() {
        this.showCreateRecordForm = false;
    }

    handleCustomTaskCreated(event) {
        const evt = new ShowToastEvent({
            title: "Custom Task created",
            message: "Record ID: " + event.detail.id,
            variant: "success"
        });
        this.dispatchEvent(evt);
        this.showCreateRecordForm = false;
        return refreshApex(this.wiredCustomTask);
    }

    editCustomTask() {
        this[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: {
                objectApiName: 'CustomTask__c',
                actionName: 'edit'
            },
        });
    }
 
}