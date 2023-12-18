const userModel = require("../model/user");

async function mergeRoleList(arr_1, arr_2, has_per = true) {
  let list = [];
  let cate_lv1 = [];
  let cate_lv2 = [];
  let row1 = null
  let row2 = null
  let r1 = null
  let r2 = null
  

  arr_1.forEach(async (r) => {
    if (arr_2.includes(r.U_CATE_CODE)) {
      r.HAS_PER = has_per;
    } else {
      r.HAS_PER = !has_per;
    }
    if (r.U_CATE_DEPT == 3) {
      if (!(r.U_CATE_PCD in cate_lv2)) {
         row2 =  await userModel.select_prog_by_code(r.U_CATE_PCD)
        if (row2.length > 0) {
          cate_lv2[r.U_CATE_PCD] = row2;
        }
      } else {
        row2 = cate_lv2[r.U_CATE_PCD];
      }
      if (row2) {
          if (!(row2.U_CATE_PCD in cate_lv1)) {
            row1 = await userModel.select_prog_by_code(row2.U_CATE_PCD);
            if (row1.length > 0) {
                cate_lv1[row2.U_CATE_PCD] = row1;
            }
        }else {
          row1 = cate_lv1[row2.U_CATE_PCD];
        }
          if (!list[row1.U_CATE_CODE]) {
            list[row1.U_CATE_CODE] = {
                code: row1.U_CATE_CODE,
                names: {
                    vn: row1.U_CATE_NAME,
                    en: row1.U_CATE_NAME_EN,
                    kr: row1.U_CATE_NAME_KR
                }
            };
        }
        if (!list[row1.U_CATE_CODE]) {
          list[row1.U_CATE_CODE].items[row2.U_CATE_CODE] = {
              code: row2.U_CATE_CODE,
              names: {
                  vn: row2.U_CATE_NAME,
                  en: row2.U_CATE_NAME_EN,
                  kr: row2.U_CATE_NAME_KR
              }
          };
        }
        list[row1.U_CATE_CODE].items[row2.U_CATE_CODE].items[r.U_CATE_CODE] = {
          code: r.U_CATE_CODE,
          names: {
              vn: r.U_CATE_NAME,
              en: r.U_CATE_NAME_EN,
              kr: r.U_CATE_NAME_KR
          },
          chk_flag: r.HAS_PER
        };
      }
    }else if (r.U_CATE_DEPT === 2){
      if (!(r.U_CATE_PCD in cate_lv1)) {
        r1 =  await userModel.select_prog_by_code(r.U_CATE_PCD)
       if (r1.length > 0) {
         cate_lv1[r1.U_CATE_PCD] = r1;
       }
      } else{
          r1 = cate_lv1[r.U_CATE_PCD] 
      }
      if (!list[r1.U_CATE_CODE]) {
        list[r1.U_CATE_CODE] = {
            code: r1.U_CATE_CODE,
            names: {
                vn: r1.U_CATE_NAME,
                en: r1.U_CATE_NAME_EN,
                kr: r1.U_CATE_NAME_KR
            }
        };
      }
      list[r1.U_CATE_CODE].items[r.U_CATE_CODE] = {
        code: r.U_CATE_CODE,
        names: {
            vn: r.U_CATE_NAME,
            en: r.U_CATE_NAME_EN,
            kr: r.U_CATE_NAME_KR
        },
        chk_flag: r.HAS_PER
      };
    }else{
      list[r.U_CATE_CODE] = {
        code: r.U_CATE_CODE,
        names: {
            vn: r.U_CATE_NAME,
            en: r.U_CATE_NAME_EN,
            kr: r.U_CATE_NAME_KR
        },
        chk_flag: r.HAS_PER
    };
    }
  }
    
 
  );

console.log(list)
  let list_progs = []
  let a = b = $ = 0;
  for (const r1 of Object.values(list)) {
    b = c = 0;
    list_progs[a] = {
        code: r1.code,
        names: r1.names
    };

    if (r1.chk_flag !== undefined) {
        list_progs[a].chk_flag = r1.chk_flag;
    }

    if (r1.items && r1.items.length > 0) {
        for (const r2 of r1.items) {
            c = 0;
            list_progs[a].items[b] = {
                code: r2.code,
                names: r2.names
            };

            if (r2.chk_flag !== undefined) {
                list_progs[a].items[b].chk_flag = r2.chk_flag;
            }

            if (r2.items && r2.items.length > 0) {
                for (const r3 of r2.items) {
                    list_progs[a].items[b].items[c] = {
                        code: r3.code,
                        names: r3.names
                    };

                    if (r3.chk_flag !== undefined) {
                        list_progs[a].items[b].items[c].chk_flag = r3.chk_flag;
                    }

                    c++;
                }
            }
            b++;
        }
    }
    a++;
}
  return list_progs;
}

module.exports = { mergeRoleList };
