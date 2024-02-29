const logger = require("../../config/logger");
const { messageError } = require("../helper/message");
const { responseErrorInput } = require("../helper/response");
const _ = require('lodash');

module.exports = {    
   
     validationMartAdd(req, res, next) {

        let logBase = `validation/mart/Add: `;
        
        let fieldData = _.pick(req.body, [
            'add_group', 'add_level', 'address', 'bizhour_close', 'bizhour_open', 'city', 'contact_email', 'contact_name', 'contact_phone',
            'district', 'group_no', 'group_payment_crc', 'group_payment_xod', 'is_custom_app', 'is_use_ymart', 'is_ymart', 'license', 'local_partner',
            'local_partner_logic', 'logo', 'logo_push', 'mart_business_type', 'mart_display', 'mart_pm_crc', 'mart_pm_xod', 'martcommon',
            'name', 'op_payment', 'order_sync', 'partner_company', 'phone', 'pop', 'pop_logic', 'pos', 'pos_code', 'pos_company', 'pos_connect',
            'pos_connect_logic', 'pos_regcode', 'push_key_android', 'push_key_ios', 'receipt', 'receipt_logic', 's_date_billing',
            's_date_service', 's_discount', 's_discount_period', 's_payment', 's_type', 'set_delivery', 'spt_code',
            'store_pick_time_interval', 'store_pk_cod', 'store_set_hour', 'store_set_hour_end', 'store_set_hour_start', 'headFranchiseType',
            'typemart', 'u_id', 'u_pwd', 'u_pwd_conf', 'group_mart_code', 'partner' , 'sale_team' ,'mart_name', 'logo_name', 'logo_push_name',
            'term_id','mpass','mart_type','store_pickup_cod'
          ]);
        req.fieldData = fieldData
        next()
         
    },
     validationMartEdit(req, res, next) {

        let logBase = `validation/mart/Edit: `;
        
        let fieldData = _.pick(req.body, [
            'account_status', 'address', 'bizhour_close', 'bizhour_open', 'can_edit_sync_order', 'city', 'contact_email', 'contact_name', 'contact_phone',
            'district', 'group_no', 'hideInitial', 'hq_code', 'is_custom_app', 'is_extend_brgn', 'is_tdc', 'is_use_ymart', 'license',
            'local_partner', 'logo_name', 'logo_push_name', 'logo_push_url', 'logo_url', 'mart_business_type', 'mart_db',
            'mart_display_status', 'mart_type', 'mart_code', 'mart_name', 'mms', 'mms_deposit', 'mpass', 'old_group_mart', 'old_type',
            'op_payment', 'order_sync', 'partner', 'paymentCOD', 'paymentOnline', 'pg_code', 'phone', 'pop', 'pos', 'pos_code', 'pos_connect', 'pos_regcode',
            'push_key_android', 'push_key_ios', 'receipt', 'receive_begin_hours', 'receive_end_hours', 'receive_option', 's_date_billing',
            's_date_service', 's_discount', 's_discount_period', 's_payment', 's_type', 'sale_team', 'set_delivery', 'show_franchise',
            'status', 'store_pick_time_interval', 'store_pickup_cod', 'store_set_hour', 'store_set_hour_end', 'store_set_hour_start',
            'term_id', 'time_sync_tdc', 'headFranchiseType', 'integrated_messging', 'is_sync_image_by_group', 'value_sync_image_by_group'
          ]);
        req.fieldData = fieldData
        next()
         
    },


}