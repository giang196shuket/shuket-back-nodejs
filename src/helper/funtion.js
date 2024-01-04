const userModel = require("../model/user");

async function mergeRoleList(arrUser, arrCodeLevel, hasPer = true) {
  console.time('AVOID DUP')
  const arrTemp = [...arrUser, ...arrCodeLevel]
  // chống trùng lặp khi merge 2 mảng
  let arrMerge =[]
  let uniqueObject = {};
     for (let i in arrTemp) {
         objTitle = arrTemp[i]['U_CATE_CODE'];
         uniqueObject[objTitle] = arrTemp[i];
    }
  for (i in uniqueObject) {
    arrMerge.push(uniqueObject[i]);
  }
   // chống trùng lặp khi merge 2 mảng
   console.timeEnd('AVOID DUP')

  let list = [];
  let listSub = [];

  console.time('SUB')
  //lấy danh sách sub
  for await (const cateUser of arrMerge) {
    if (cateUser.U_CATE_DEPT === 3) {
      const data = await userModel.selectProgByCode(cateUser.U_CATE_CODE);

      listSub.push({
        code: data.U_CATE_CODE,
        route: data.URL,
        sort3: data.SORT_ORDER,
        parent: data.U_CATE_PCD,
        name: {
          vn: data.U_CATE_NAME,
          en: data.U_CATE_NAME_EN,
          kr: data.U_CATE_NAME_KR,
        },
      });
    }
  }
    //lấy danh sách sub
    console.timeEnd('SUB')

    console.time('MERGE')
  //lấy danh sách chính và merge với danh sách sub
  for await (const cateUser of arrMerge) {
    if (cateUser.U_CATE_DEPT === 3) {
      const data = await userModel.selectProgByCode(cateUser.U_CATE_PCD);
      const parentIndex = list.findIndex((ls) => ls.group_code === data.U_CATE_PCD)
      if (! list[parentIndex].group_items.find((ls) => ls.code === data.U_CATE_CODE)) {
        if(listSub.find((su) => su.parent === data.U_CATE_CODE)){
          list[parentIndex].group_items.push({
            code: data.U_CATE_CODE,
            route: data.URL,
            sort2: data.SORT_ORDER,
            parent: data.U_CATE_PCD,
            name: {
              vn: data.U_CATE_NAME,
              en: data.U_CATE_NAME_EN,
              kr: data.U_CATE_NAME_KR,
            },
            sub_items: listSub.filter((su) => su.parent === data.U_CATE_CODE),
          });
        }else{
          list[parentIndex].group_items.push({
            code: data.U_CATE_CODE,
            route: data.URL,
            sort2: data.SORT_ORDER,
            parent: data.U_CATE_PCD,
            name: {
              vn: data.U_CATE_NAME,
              en: data.U_CATE_NAME_EN,
              kr: data.U_CATE_NAME_KR,
            }
          });
        }
       
      }
      
    } else if (cateUser.U_CATE_DEPT === 2) {
      const data = await userModel.selectProgByCode(cateUser.U_CATE_PCD);
      if (!list.find((ls) => ls.group_code === data.U_CATE_CODE)) {
        let group_items = []
        if(listSub.find((su) => su.parent === data.U_CATE_CODE)){
           group_items = arrMerge
          .filter((cu) => cu.U_CATE_PCD === data.U_CATE_CODE)
          .map(function (cate) {
            return {
              code: cate.U_CATE_CODE,
              route: cate.URL,
              sort2: cate.SORT_ORDER,
              parent: cate.U_CATE_PCD,
              name: {
                vn: cate.U_CATE_NAME,
                en: cate.U_CATE_NAME_EN,
                kr: cate.U_CATE_NAME_KR,
              },
              sub_items: listSub.filter((su) => su.parent === data.U_CATE_CODE),
            };
          });
        }else{
           group_items = arrMerge
          .filter((cu) => cu.U_CATE_PCD === data.U_CATE_CODE)
          .map(function (cate) {
            return {
              code: cate.U_CATE_CODE,
              route: cate.URL,
              sort2: cate.SORT_ORDER,
              parent: cate.U_CATE_PCD,
              name: {
                vn: cate.U_CATE_NAME,
                en: cate.U_CATE_NAME_EN,
                kr: cate.U_CATE_NAME_KR,
              },
            };
          });
        }
      
        list.push({
          group_code: data.U_CATE_CODE,
          group_route: data.URL,
          group_sort: data.SORT_ORDER,
          group_names: {
            vn: data.U_CATE_NAME,
            en: data.U_CATE_NAME_EN,
            kr: data.U_CATE_NAME_KR,
          },
          group_items: group_items,
        });
      }
    }
  }
  //lấy danh sách chính và merge với danh sách sub
  console.timeEnd('MERGE')

  return list;
}

module.exports = { mergeRoleList };
