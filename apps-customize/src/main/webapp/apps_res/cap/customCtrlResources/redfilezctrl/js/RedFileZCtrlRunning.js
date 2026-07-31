(function() {
    csdk.component.register('field_1747014682398', function() {
        var metaData = csdk.core.getMetaData(); //获取metaData
        return {
            type: 'raw',
            plugin: {
                install: function () {
                    console.log('111')
                },
                requiredAssert: function (data) {
                    if (data.isNotNull == 1 && data.value == '') return false;
                    return true;
                }
            },
            implement: {
                init: function (context, container) {
                    var ctx = this;

                    var rightId = metaData.rightId;
                    var moduleId = metaData.moduleId;//模板id
                    var formId = metaData.contentDataId;//表单主数据Id
                    var templateId = metaData.contentTemplateId;//表单id
                    var formFieldId = ctx.$data.id;//当前控件id
                    var relationship = ctx.$data.customFieldInfo.customParam && ctx.$data.customFieldInfo
                        .customParam[''] ? ctx.$data.customFieldInfo
                        .customParam[''].relationship : '';
                    //明细表作为选择器字段关联选择的字段
                    var selectorFieldName = ctx.$data.customFieldInfo.customParam && ctx.$data.customFieldInfo.customParam[''] ? ctx.$data.customFieldInfo.customParam[''].selectorFieldName : '';
                    var tableName = ctx.$data && ctx.$data.tableName; //获取当前控件选择的表
                    var ctrlTitleStyle = ctx.$data.ctrlTitleStyle;//是否显示标题
                    var result = '';
                    switch (ctrlTitleStyle) {
                        case 'linewrap':
                            result = 'is-two';
                            break;
                        case 'inline':
                            result = 'is-one';
                            break;
                        case 'none':
                            result = 'is-none';
                            break;
                        default:
                            break;
                    }
                    var el = document.createElement('section');
                    var showValue = ctx.$data.showValue;
                    //此处HTML 需要根据需求自行组装 todo
                    // todo 隐藏 ctx.$data.auth === 'browse'  ctx.$data.auth === 'hide'
                    // todo 编辑 ctx.$data.auth === 'edit'
                    // todo 穿透 ctx.$data.relationData && ctx.$data.relationData.imgShow === '1'

                    var showHTML = '';
                    showHTML += '<section class="cap4-text ' + result + '">';
                    showHTML += '<div class="cap4-text__left field-title">' + this.$data.display + '</div>';
                    if (ctx.$data.auth == 'browse' || ctx.$data.auth == 'hide') {
                        showHTML += '<div class="cap4-text__right field-content-wrapper">';
                        showHTML += '<input type="text" class="is-relatinbrowse'+this.$data.id+'" value="'+showValue+'" readonly>'
                    } else {
                        showHTML += '<div class="cap4-text__right field-content-wrapper is-relation">';
                        showHTML += '<div class="cap4-text__cnt field-content" >'
                        showHTML += '<input type="text" class="is-relatinbrowse'+this.$data.id+'" value="'+showValue+'">'
                        showHTML += ' </div>'
                    }
                    showHTML += '</div>';
                    showHTML += '</section>';
                    el.innerHTML = showHTML;
                    container.innerHTML = '';
                    container.appendChild(el);
                    setTimeout(function () {
                        if (csdk && csdk.core && csdk.core.relayout)
                            csdk.core.relayout();
                    }, 0);
                    ctx.$el = el;
                    var searchEL = el.querySelector('.is-relatinbrowse'+this.$data.id);
                    // 绑定事件
                    if (searchEL && (ctx.$data.auth === 'edit' || (ctx.$data.relationData && ctx.$data.relationData.imgShow === '1'))) {
                        ctx.$on(searchEL, 'click', function (event) {
                            //获取当前控件选择的明细表
                            var selectRecordData = csdk.core.getSelectedRecord(tableName);
                            var recordId = '';
                            if (selectRecordData) {
                                recordId = selectRecordData.recordId;
                            }
                            //判断当前选择的关联选择器是主表还是明细表;
                            if (window.csdk.core.getFieldData({fieldId: selectorFieldName})) {
                                selectorFieldName = null;
                            }
                            if (relationship == '' && ctx.$data && ctx.$data.relationInfo && ctx.$data.relationInfo.length > 0) {
                                relationship = ctx.$data.relationInfo[0].relationShipId
                            }
                            var isStandandRelation = 0;
                            var mainSelector = '';
                            if (ctx.$data && ctx.$data.relationInfo && ctx.$data.relationInfo.length > 0) {
                                isStandandRelation = 1;
                                mainSelector = ctx.$data.relationInfo[0].mainSelector;
                            }
                            backList=[];
                            backList.push({
                                fieldId: formFieldId,
                                recordId: recordId,
                                tableName: tableName,
                                fieldData: {
                                    display: $(event.currentTarget).val(),
                                    value: $(event.currentTarget).val(),
                                    showValue2: $(event.currentTarget).val()
                                }
                            })
                            csdk.core.setFieldData(backList);
                            ctx.openViewPage(templateId, formId, formFieldId, relationship, moduleId, rightId, recordId, tableName, ctx.$data.value, selectorFieldName, isStandandRelation, mainSelector);//ctx.$data.value当前控件的值
                        });
                    }
                    switch (ctx.$data.auth) {
                        case 'edit':
                            var isNotNull =
                                ctx.$data.isNotNull == 1 &&
                                ctx.$data.value == '';
                            el.style.background = isNotNull ?
                                ctx.$data.fieldNotNullColorMap :
                                '#ffffff';
                            break;

                        case 'browse':
                            // search = '';
                            break;

                        case 'hide':
                            // search = '';
                            el.innerHTML = '';
                            el.style.cssText =
                                'display: flex;display: -ms-flexbox;display: -moz-flex;border-radius: 2px;';
                            break;
                    }
                },
                update: function () {
                    this.init();
                },
                destroy: function () {
                    this.$el = null;
                },
                beforeSave: function () {
                },
                afterSave: function () {
                },
                openViewPage: function (templateId, formId, formFieldId, relationship, moduleId, rightId, recordId, tableName, ctrlValue, selectorFieldName, isStandandRelation, standMainSelector) {
                    var ctx = this;
                    var mainSelector = "";
                    var isFormson = '0';
                    var originCurSeFieldId = formFieldId;
                    if (selectorFieldName && recordId) {
                        formFieldId = selectorFieldName;
                        isFormson = '1';
                    } else {
                        mainSelector = formFieldId;
                    }
                    var formType = 'formInsert';
                    if (isStandandRelation == '1') {
                        if (tableName.indexOf('formmain') > 0) {
                            formType = "formmain";
                            mainSelector = formFieldId;
                        } else {
                            formType = "formson";
                            mainSelector = standMainSelector;
                        }
                        // mainSelector = standMainSelector == formFieldId?'1':'0'
                    }
                    var randomNum = Math.random();
                    var querString = `&_ran=${encodeURIComponent(randomNum)}&type=relation&formType=${formType}&tbName=&fieldId=${formFieldId}&recordId=${recordId}&mainSelector=${mainSelector}&relationShipId=${relationship}&tempId=${templateId}&fdId=${formId}&selectedMasterDataId=&toMasterDataId=&moduleId=${moduleId}`;
                    var tplConfig = {
                        "platform": 1,
                        "app": 67,
                        "category": "tpRelationList",
                        "bizId": "",
                        "formId": formId,
                        "sourceId": ""
                    };
                    var src = (window._ctxPath || ctpTop._ctxPath) + '/rest/cap4/pageDesign/tpl/index.html?p=' + encodeURIComponent(JSON.stringify(tplConfig)) + querString
                    var submitData = csdk.core.getSubmitData();
                    // todo 发送后端回填数据接口，后端回填,强烈建议后端回填
                },
                showProgressBar: function (value) {
                    if (value) {
                        window.fill_progressBar = window
                            .getCtpTop()
                            .$.progressBar({
                                text: ''
                            });
                    } else {
                        window.fill_progressBar &&
                        window.fill_progressBar.close();
                    }
                }
            }
        };
    });
})();
