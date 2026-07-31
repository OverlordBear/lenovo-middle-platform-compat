package com.seeyon.apps.eu.fieldCtrl;


import com.seeyon.cap4.form.bean.ParamDefinition;
import com.seeyon.cap4.form.bean.fieldCtrl.FormFieldCustomCtrl;
import com.seeyon.cap4.form.util.Enums;

public class FileZCtrl extends FormFieldCustomCtrl{

    @Override
    public String getMBInjectionInfo() {
        return null;
    }

    @Override
    public String getPCInjectionInfo() {
        return "{path:'apps_res/eu/cap4CtrlResources/',jsUri:'js/fileZCtrl.js',initMethod:'init',nameSpace:'field_324591185229988128'}";
    }

    @Override
    public String[] getDefaultVal(String arg0) {
        return null;
    }

    public String getFieldLength() {
        return "500";
    }
    
    @Override
    public String getKey() {
        return "324591185229988128";
    }

    @Override
    public String getText() {
        return "FileZ集成";
    }

    @Override
    public void init() { 
        this.setIcon("cap-icon-e-invoice");
        this.setPluginId("eu");
        ParamDefinition eivoiceDef = new ParamDefinition();
        eivoiceDef.setDisplay("FileZ集成");//如果要做国际化 这个地方只能存key
        eivoiceDef.setName("mapping");
        eivoiceDef.setParamType(Enums.ParamType.text);
        addDefinition(eivoiceDef);
    }

}
