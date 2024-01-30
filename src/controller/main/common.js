const { countCharacter } = require("../../helper/funtion");

module.exports = {
    
async  mergeRoleList(menuUser) {
    let list = [];
    menuUser.forEach((ele) => {
      if (ele.U_CATE_DEPT === 1) {
        list.push({
          group_code: ele.U_CATE_CODE,
          group_route: ele.URL,
          group_sort: ele.SORT_ORDER,
          group_names: {
            vn: ele.U_CATE_NAME,
            en: ele.U_CATE_NAME_EN,
            kr: ele.U_CATE_NAME_KR,
          },
          group_items: menuUser
            .filter((cu) => cu.U_CATE_PCD === ele.U_CATE_CODE)
            .map(function (cate) {
              //cate la depp2
              if (cate.U_CATE_DEPT !== 1) {
                return {
                  code: cate.U_CATE_CODE,
                  route: cate.URL,
                  sort2: cate.SORT_ORDER,
                  name: {
                    vn: cate.U_CATE_NAME,
                    en: cate.U_CATE_NAME_EN,
                    kr: cate.U_CATE_NAME_KR,
                  },
                  sub_items: menuUser
                    .filter((c) => c.U_CATE_PCD === cate.U_CATE_CODE)
                    .map(function (c) {
                      //c la depp3
                      return {
                        code: c.U_CATE_CODE,
                        route: countCharacter(c.URL,'/') === 1 ? '/moa' + c.URL : c.URL,
                        sort3: c.SORT_ORDER,
                        name: {
                          vn: c.U_CATE_NAME,
                          en: c.U_CATE_NAME_EN,
                          kr: c.U_CATE_NAME_KR,
                        },
                      };
                    }),
                };
              }
            })
            .filter((gi) => gi !== undefined),
        });
      }
    });
    return list;
  }
  
}