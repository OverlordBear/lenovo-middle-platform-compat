package com.seeyon.cap4.form.bean.fieldCtrl;
import com.seeyon.cap4.form.bean.FieldViewCtl;
import com.seeyon.cap4.form.bean.FormBean;
import com.seeyon.cap4.form.bean.FormDataMasterBean;
import com.seeyon.cap4.form.bean.FormFieldBean;
import com.seeyon.cap4.form.bean.FormFieldComEnum;
import com.seeyon.cap4.form.bean.ParamDefinition;
import com.seeyon.cap4.form.bean.fieldCtrl.FormFieldCustomCtrl;
import com.seeyon.cap4.form.bean.fieldCtrl.FormFieldCustomCtrlReportInfo;
import com.seeyon.cap4.form.bean.fieldCtrl.FormFieldCustomCtrlRunInfo;
import com.seeyon.cap4.form.bean.fieldCtrl.FormFieldUtil;
import com.seeyon.cap4.form.modules.engin.formula.CAP4FormSysFunctionManager;
import com.seeyon.cap4.form.modules.engin.formula.FormulaEnums;
import com.seeyon.cap4.form.modules.engin.formula.validate.ValidateResult;
import com.seeyon.cap4.form.modules.importandexport.BusinessDataBean;
import com.seeyon.cap4.form.util.Enums;
import com.seeyon.cap4.form.util.FormConstant;
import com.seeyon.ctp.common.AppContext;
import com.seeyon.ctp.common.exceptions.BusinessException;
import com.seeyon.ctp.common.formula.enums.DataType;
import com.seeyon.ctp.common.i18n.ResourceUtil;
import com.seeyon.ctp.common.log.CtpLogFactory;
import com.seeyon.ctp.form.bean.FormSerialNumberBean;
import com.seeyon.ctp.form.service.FormCacheManager;
import org.apache.commons.lang.StringUtils;
import org.apache.commons.logging.Log;

import javax.inject.Inject;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
/**
 * @author 系统生成
 * @decription 
 * @Date 2025-11-23 21:02:32
 */

public class FormTestControl extends FormFieldCustomCtrl {
    private static final Log LOGGER = CtpLogFactory.getLog(FormTestControl.class);
    @Inject
    private CAP4FormSysFunctionManager cap4FormSysFunctionManager;

    public void setCap4FormSysFunctionManager(CAP4FormSysFunctionManager cap4FormSysFunctionManager) {
        this.cap4FormSysFunctionManager = cap4FormSysFunctionManager;
    }

    @Override
    public Enums.CustomCtrlPlatformVersion getVersion() {
        return Enums.CustomCtrlPlatformVersion.PlatformTwo;
    }

    @Override
    public Enums.FieldType[] getFieldType() {
        return new Enums.FieldType[]{Enums.FieldType.VARCHAR, Enums.FieldType.LONGTEXT};
    }

    @Override
    public void init() {
        this.setPluginId("formtestcontrol");
        this.setIcon("cap-icon-ordermanage");
        ParamDefinition param1 = new ParamDefinition();
        param1.setDialogUrl("apps_res/cap/customCtrlResources/formtestcontrol/html/index.html");
        param1.setDisplay("测试控件");
        param1.setName("");
        param1.setParamType(Enums.ParamType.button);
        param1.setDialogWidth("400");
        param1.setDialogHeight("200");
        param1.setDialogTitle("测试控件设置");
        params.add(param1);
    }

    @Override
    public String mappingStandardCtrlType() {
        return FormFieldComEnum.TEXT.getKey();
    }

    @Override
    public String getPCInjectionInfo() {
        return "{path:'apps_res/cap/customCtrlResources/formtestcontrol/',jsUri:'js/FormTestControlRunning.js',initMethod:'init',nameSpace:'field_" + this.getKey() + "'}";
    }

    @Override
    public String getMBInjectionInfo() {
        return "{path:'http://formtestcontrol.v5.cmp/v/',weixinpath:'formtestcontrol/',jsUri:'js/FormTestControlmRunning.js',initMethod:'init',nameSpace:'field_" + this.getKey() + "'}";
    }

    @Override
    public boolean needClearWhenBackToStarter() {
        return false;
    }

    @Override
    public String getKey() {
        return "1763902952330";
    }

    @Override
    public String getText() {
        return ResourceUtil.getString("formtestcontrol.label");
    }

    @Override
    public String[] getDefaultVal(String s) {
        String[] arr = {"A", "B"};
        return arr;
    }

    @Override
    public boolean canUse() {
        return true;
    }

    @Override
    public boolean canInCalc() {
        return true;
    }

    @Override
    public boolean canInDataList() {
        return true;
    }

    @Override
    public boolean canBathUpdate() {
        return true;
    }


    /**
     * 参与流程表单相关数据查询接口。自定义控件默认都是false
     */
    @Override
    public boolean canInRelatedDataCondition() {
        return true;
    }

    /**
     * 参与触发关系映射接口
     * 自定义控件默认都是false， 有需要的自行重写
     */
    @Override
    public boolean canInTriggerFillBack() {
        return true;
    }

    /**
     * 能否参与excel导入导出，默认是false
     */
    @Override
    public boolean canInExcelExpOrImp() {
        return true;
    }

    @Override
    public boolean canInUnFlowBindOperationScope() {
        return true;
    }

    @Override
    public boolean canInWorkFlowBranch() {
        return true;
    }

    @Override
    public boolean canInRelationFillBack() {
        return true;
    }

    /**
     * 业务关系设置的时候，能不能给这个字段设置穿透信息
     *
     * @return
     * @author wangh
     * @since V8.0
     */
    @Override
    public boolean canThroughSet() {
        return true;
    }

    /**
     * 是否能一键复制
     *
     * @return
     */
    @Override
    public Boolean canAKeyToCopy() {
        return true;
    }

    @Override
    public FieldViewCtl setFieldViewCtl() {
        FieldViewCtl fieldViewCtl = new FieldViewCtl();
        FieldViewCtl.ViewParam viewParam = new FieldViewCtl.ViewParam(true, true, true,
                true, true);
        FieldViewCtl.Client client = new FieldViewCtl.Client(true, true);
        fieldViewCtl.setCount(5);//一个表单最多几个控件
        fieldViewCtl.setTargets(viewParam);
        fieldViewCtl.setClients(client);
        return fieldViewCtl;
    }

    @Override
    public FormFieldCustomCtrlRunInfo getRenderInfo4Run() {
        FormFieldCustomCtrlRunInfo runInfo = new FormFieldCustomCtrlRunInfo();
        /*// PC列表
        FormFieldCustomCtrlInjectInfo pcList = new FormFieldCustomCtrlInjectInfo();
        pcList.setPath("apps_res/cap/customCtrlResources/formRichText2CtrlResources/");
        pcList.setNameSpace(getListNameSpace());
        pcList.setJsUri("js/projectRelatedPCList.umd.min.js");
        runInfo.setPcList(pcList);

        // PC普通筛选
        FormFieldCustomCtrlInjectInfo pcFilter = new FormFieldCustomCtrlInjectInfo();
        pcFilter.setPath("apps_res/cap/customCtrlResources/formRichText2CtrlResources/");
        pcFilter.setNameSpace(getFilterNameSpace());
        pcFilter.setJsUri("js/formRichTextPcRunning.js,initMethod:'init',nameSpace:'field_\" + this.getKey() + \"'");
        runInfo.setPcFilter(pcFilter);

        // 移动端列表
        FormFieldCustomCtrlInjectInfo mList = new FormFieldCustomCtrlInjectInfo();
        mList.setPath("http://customCtrlResources.v5.cmp/v1.0.0/");
        mList.setWeixinPath("customCtrlResources");
        mList.setNameSpace(getListNameSpace());
        mList.setJsUri("formRichText2CtrlResources/js/projectRelatedMList.umd.min.js");
        runInfo.setMobileList(mList);

        // 移动端普通筛选
        FormFieldCustomCtrlInjectInfo mFilter = new FormFieldCustomCtrlInjectInfo();
        mFilter.setPath("http://customCtrlResources.v5.cmp/v1.0.0/");
        mFilter.setWeixinPath("customCtrlResources");
        mFilter.setNameSpace(getFilterNameSpace());
        mFilter.setJsUri("formRichText2CtrlResources/js/projectRelatedMFilter.umd.min.js");
        runInfo.setMobileFilter(mFilter);*/

        return runInfo;
    }

    /**
     * 获取列表区作用域
     *
     * @return
     */
    private String getListNameSpace() {
        return getNameSpace("List");
    }

    /**
     * 获取条件区作用域
     *
     * @return
     */
    private String getFilterNameSpace() {
        return getNameSpace("Filter");
    }

    /**
     * 获取全局命名空间
     *
     * @param uniqueKey
     * @return
     */
    protected String getNameSpace(String uniqueKey) {
        return StringUtils.uncapitalize(getClass().getSimpleName()) + uniqueKey + getKey();
    }

    @Override
    public FormFieldCustomCtrlReportInfo canShowInReport() {
        FormFieldCustomCtrlReportInfo reportInfo = new FormFieldCustomCtrlReportInfo();
        reportInfo.setEnableQuery(true);
        reportInfo.setEnableDisplayField(true);
        reportInfo.setEnableSort(true);
        reportInfo.setEnableFilterField(true);
        return reportInfo;
    }

    @Override
    public Map<String, Object> getAuthDefaultValueMap(FormFieldBean fieldBean, Long formId) throws BusinessException {
        Map<String, Object> returnMap = new HashMap<String, Object>(16);
        Map<String, String> disableMap;//确定哪些输入框或选择框能编辑
        List<String[]> data_system = new ArrayList<String[]>();//系统变量选项

        if (fieldBean.getFormConditionList() != null && fieldBean.getFormConditionList().size() > 0) {
            disableMap = FormFieldUtil.getDisableMap2AuthDefaultValue("disabled", "disabled", "disabled");
        } else {
            if (FormConstant.URL_PAGE.equals(fieldBean.getFormatType())) {
                disableMap = FormFieldUtil.getDisableMap2AuthDefaultValue("", "disabled", "");
            } else {
                disableMap = FormFieldUtil.getDisableMap2AuthDefaultValue("", "", "");
            }
            if (fieldBean.getFieldType().equalsIgnoreCase(Enums.FieldType.DECIMAL.getKey())) {
                for (FormulaEnums.FormulaVar fv : FormulaEnums.FormulaVar.values()) {
                    if (fv.getKey().startsWith("date_dec_")) {
                        data_system.add(new String[]{fv.getKey(), fv.getText()});
                    }
                }
                Map<String, Object> param = new HashMap<>();
                param.put("dataTypes", new DataType[]{DataType.Numberic});
                param.put("showAccount", "true");
                param.put("createTime", "desc");
                param.put("formId", formId);
                List<Map<String, Object>> constantList = cap4FormSysFunctionManager.getConstantList(param);
                for (Map<String, Object> map : constantList) {
                    data_system.add(new String[]{map.get("formulaName").toString(), map.get("display").toString()});

                }
            } else {
                for (FormulaEnums.FormulaVar fv : FormulaEnums.FormulaVar.values()) {
                    if (fv.isCanSetDefault()) {
                        data_system.add(new String[]{fv.getKey(), fv.getText()});
                    }
                }
                if (fieldBean.isMasterField()) {
                    FormCacheManager formCacheManager = (FormCacheManager) AppContext.getBean("formCacheManager");
                    List<FormSerialNumberBean> numberList = formCacheManager.getAccountUnuseSerialNumberList(formId);
                    for (FormSerialNumberBean fsb : numberList) {
                        data_system.add(new String[]{"" + fsb.getId(), fsb.getVariableName(), "isserialnum"});
                    }
                }

                Map<String, Object> param = new HashMap<>();
                param.put("dataTypes", new DataType[]{DataType.String});
                param.put("showAccount", "true");
                param.put("formId", formId);
                param.put("createTime", "desc");
                List<Map<String, Object>> constantList = cap4FormSysFunctionManager.getConstantList(param);
                for (Map<String, Object> map : constantList) {
                    data_system.add(new String[]{map.get("formulaName").toString(), map.get("display").toString()});

                }


            }
        }

        returnMap.put("disableMap", disableMap);
        returnMap.put("data_handWork", null);
        returnMap.put("data_system", data_system);
        return returnMap;
    }

    /**
     * 自定义控件extend扩展计算公式页面url
     *
     * @return 返回自定义控件自定义extend计算公式配置页面url，默认返回空
     */
    @Override
    public String extendUrl() {
        return "";
    }

    /**
     * 前端控制视图显示的config.json信息，该信息需要开发自定义控件用户自己实现，并将js配置到config.json中，
     * 前端通到config.json中取对应的js用于渲染；
     * 如查询条件，列表，报表等
     * <p>
     * {
     * "key": "1745730351955790712",
     * "name": "formrichtext2ctrl",
     * "path": {
     * "pc": "apps_res/cap/customCtrlResources/formRichText2CtrlResources/js",
     * "wap": "m3/apps/v5/customCtrlResources/formrichtext2ctrl/js",
     * "native": "http://customCtrlResources.v5.cmp/v1.0.0/js"
     * },
     * "render": {
     * "defRender": {
     * "filter": "defRenderFilter.js",
     * "list": "defRenderList.js"
     * },
     * "render1": {
     * "filter": "render1Filter.js",
     * "list": "render1List.js",
     * "087C5688-8C95-49B9-2502-6727D6C3YY91": {
     * "filter": "render1Filter.js",
     * "list": "render1List.js"
     * }
     * },
     * "render2": {
     * "filter": "render1Filter.js",
     * "list": "render1List.js",
     * "087C5688-8C95-49B9-2502-6727D6C3YY91": {
     * "filter": "render1Filter.js",
     * "list": "render1List.js"
     * }
     * }
     * },
     * "renderMapping": {
     * "cap4query": "render1",
     * "cap4unflow": {
     * "filter": "render2Filter.js",
     * "list": "render2List.js",
     * "087C5688-8C95-49B9-2502-6727D6C35502": {
     * "filter": "render3Filter.js",
     * "list": "render3List.js"
     * }
     * }
     * }
     * }
     *
     * @return config.json 文件路径
     */
    @Override
    public String viewJsUrl() {
        return "apps_res/cap/customCtrlResources/formtestcontrol/formtestcontrol.config";
    }

    @Override
    public void getJson4Export(FormBean formBean, FormFieldBean formFieldBean, BusinessDataBean businessDataBean, Map<String, Object> resultMap) {

    }

    @Override
    public boolean barcodeContent() {
        return true;
    }

    @Override
    public boolean canInjectionWord() {
        return true;
    }

    @Override
    public boolean canInFlowBusinessOperationScope() {
        return true;
    }

    @Override
    public boolean canInCap3RelationCondition(){
        return true;
    }
    /**
     * 校验公式
     *
     * @param functionStr 自定义公式字符串
     * @param elementList 结果字段
     * @param formBean    结果字段
     * @return
     */
    @Override
    public ValidateResult check(String functionStr, List<String> elementList, FormBean formBean) {
        return new ValidateResult(true, null, -1);
    }

    /**
     * 自定义公式运行
     *
     * @param formBean
     * @param condition
     * @param cacheMasterData
     * @return
     */
    @Override
    public Object run(FormBean formBean, String condition, FormDataMasterBean cacheMasterData) {
        return "111";
    }

    @Override
    public String reportRun(FormBean formBean, List<String> fields) {
        return  "("+fields.get(1).replace("{","").replace("}","")+fields.get(2)+fields.get(3) +")";
    }
}
