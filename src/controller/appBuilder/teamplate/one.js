const templateViewOneModel = require("../../../model/appBuilder/teamplate/one");
const { getCommonDestJsonData } = require("../common");

module.exports = {
    async composeTypeOneTemplateData(templateData, martId, sreenCode) {
        templateDataArr = [];
        let iRun = 0;
        if (
          templateData.tmp_period_type &&
          templateData.tmp_period_type != "CustomUse"
        ) {
          let activeClass = "";
          for await (const val of templateData?.tmpl_data) {
            let templateDetalDestFLG = null;
            let templateDetalDestCD = null;
            if ("tmpl_dt_cd" in val && val.tmpl_dt_cd) {
              //field tmpl_dt_cd tồn tại và có giá trị trong object val
              const actualData = await templateViewOneModel.getTypeOneData(
                val.tmpl_dt_cd,
                martId
              );
              if (actualData) {
                templateDetalDestFLG = null;
                templateDetalDestCD = null;
                if (sreenCode === val.tmpl_dt_dest_cd) {
                  templateDetalDestFLG = "DT";
                  templateDetalDestCD = null;
                } else {
                  templateDetalDestFLG = val.tmpl_dt_dest_flg;
                  templateDetailDestCD = val.tmpl_dt_dest_cd;
                }
                const wordValueBanner = "/banner/basic/";
                //Kiểm tra xem chuỗi con có tồn tại trong chuỗi hay không
                const resultCheckBanner =
                  actualData.T_BNR_IMAGE.toLowerCase().indexOf(
                    wordValueBanner.toLowerCase()
                  );
                const commonDest = await  getCommonDestJsonData(
                  templateData.tmpl_type,
                  templateDetalDestFLG,
                  templateDetalDestCD,
                  null,
                  martId
                );
                if (commonDest?.showSub == 0) {
                  if (iRun == 0) {
                    activeClass = "active";
                  } else {
                    activeClass = "";
                  }
      
                  if (resultCheckBanner != false) {
                    templateDataArr.push({
                      contentsID: actualData.T_BNR_CODE,
                      imageUrl: actualData.T_BNR_IMAGE,
                      index_position: iRun,
                      class: activeClass,
                    });
                  } else {
                    templateDataArr.push({
                      contentsID: actualData.T_BNR_CODE,
                      imageUrl:
                        "https://s3.ap-northeast-2.amazonaws.com/moa.images/banner/basic/" +
                        actualData.T_BNR_IMAGE,
                      index_position: iRun,
                      class: activeClass,
                    });
                  }
                }
              }
            }
            iRun++;
          }
        } else {
          let activeClass = "";
          for await (const val of templateData?.tmpl_data) {
            if ("tmpl_dt_cd" in val && val.tmpl_dt_cd) {
              let optionBanner = "N";
              if (!val.tmpl_option_banner) {
                if (val.tmpl_sdate && val.tmpl_edate) {
                  optionBanner = "Y";
                }
              } else {
                if (val.tmpl_option_banner === "Use") {
                  optionBanner = "Y";
                }
              }
              if (optionBanner === "Y") {
                if (
                  moment(val.tmpl_sdate).isBefore(moment(), "day") &&
                  moment(val.tmpl_sdate).isAfter(moment(), "day")
                ) {
                  const actualData = await templateViewOneModel.getTypeOneData(
                    val.tmpl_dt_cd,
                    martId
                  );
                  if (actualData) {
                    templateDetalDestFLG = null;
                    templateDetalDestCD = null;
                    if (sreenCode === val.tmpl_dt_dest_cd) {
                      templateDetalDestFLG = "DT";
                      templateDetalDestCD = null;
                    } else {
                      templateDetalDestFLG = val.tmpl_dt_dest_flg;
                      templateDetailDestCD = val.tmpl_dt_dest_cd;
                    }
                    const wordValueBanner = "/banner/basic/";
                    //Kiểm tra xem chuỗi con có tồn tại trong chuỗi hay không
                    const resultCheckBanner =
                      actualData.T_BNR_IMAGE.toLowerCase().indexOf(
                        wordValueBanner.toLowerCase()
                      );
                    if (
                    await  getCommonDestJsonData(
                        templateData.tmpl_type,
                        templateDetalDestFLG,
                        templateDetalDestCD,
                        null,
                        martId
                      )?.showSub == 0
                    ) {
                      if (iRun == 0) {
                        activeClass = "active";
                      } else {
                        activeClass = "";
                      }
                      if (resultCheckBanner != false) {
                        templateDataArr.push({
                          contentsID: actualData.T_BNR_CODE,
                          imageUrl: actualData.T_BNR_IMAGE,
                          index_position: iRun,
                          class: activeClass,
                        });
                      } else {
                        templateDataArr.push({
                          contentsID: actualData.T_BNR_CODE,
                          imageUrl: actualData.T_BNR_IMAGE,
                          index_position: iRun,
                          class: activeClass,
                        });
                      }
                    }
                  }
                }
              } else {
                const actualData = await templateViewOneModel.getTypeOneData(
                  val.tmpl_dt_cd,
                  martId
                );
                if (actualData) {
                  templateDetalDestFLG = null;
                  templateDetalDestCD = null;
                  if (sreenCode === val.tmpl_dt_dest_cd) {
                    templateDetalDestFLG = "DT";
                    templateDetalDestCD = null;
                  } else {
                    templateDetalDestFLG = val.tmpl_dt_dest_flg;
                    templateDetailDestCD = val.tmpl_dt_dest_cd;
                  }
                  const wordValueBanner = "/banner/basic/";
                  //Kiểm tra xem chuỗi con có tồn tại trong chuỗi hay không
                  const resultCheckBanner =
                    actualData.T_BNR_IMAGE.toLowerCase().indexOf(
                      wordValueBanner.toLowerCase()
                    );
                  if (
                  await  getCommonDestJsonData(
                      templateData.tmpl_type,
                      templateDetalDestFLG,
                      templateDetalDestCD,
                      null,
                      martId
                    )?.showSub == 0
                  ) {
                    if (iRun == 0) {
                      activeClass = "active";
                    } else {
                      activeClass = "";
                    }
                    if (resultCheckBanner != false) {
                      templateDataArr.push({
                        contentsID: actualData.T_BNR_CODE,
                        imageUrl: actualData.T_BNR_IMAGE,
                        index_position: iRun,
                        class: activeClass,
                      });
                    } else {
                      templateDataArr.push({
                        contentsID: actualData.T_BNR_CODE,
                        imageUrl: actualData.T_BNR_IMAGE,
                        index_position: iRun,
                        class: activeClass,
                      });
                    }
                  }
                }
              }
              iRun++;
            }
          }
        }
      
        return {
          typeCode: 1,
          contentsData: templateDataArr,
          banner_count: templateDataArr.length,
        };
      }
}